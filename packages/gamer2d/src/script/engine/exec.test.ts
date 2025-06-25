import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Trait } from "../../traits/Trait";
import * as TraitFactory from "../../traits/Trait.factory"; // To mock createTrait
import { ArgColor, ArgExpression, ArgIdentifier, ArgVariable, ValueTrait } from "../../types/value.types";
import { TVars, type TVarTypes } from "../../utils/vars.utils";
import { execFnCall, execParseArgs } from "./exec.script";

describe("exec*", () => {
	let vars: TVars;

	beforeEach(() => {
		const initialVars = new Map<string, TVarTypes>();
		initialVars.set("myNum", 123);
		initialVars.set("myString", "world");
		initialVars.set("myObj", { prop: "hello" });
		initialVars.set("a", 10);
		initialVars.set("b", 5);
		vars = new TVars(initialVars);

		// Mock dependencies if they are complex or have side effects not relevant to this unit
		vi.spyOn(console, "log").mockImplementation(() => {}); // Suppress console.log from evalVar for undefined
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("execParseArgs", () => {
		it("should handle an empty array of arguments", () => {
			const result = execParseArgs({ vars }, []);
			expect(result).toEqual([]);
		});

		it("should handle number arguments", () => {
			const result = execParseArgs({ vars }, [10, 20.5]);
			expect(result).toEqual([10, 20.5]);
		});

		it("should handle plain string arguments", () => {
			const result = execParseArgs({ vars }, ["hello", "test"]);
			expect(result).toEqual(["hello", "test"]);
		});

		it("should handle interpolable string arguments", () => {
			const result = execParseArgs({ vars }, ["Hello ${myString}", "Number is ${myNum}"]);
			expect(result).toEqual(["Hello world", "Number is 123"]);
		});

		it("should handle interpolable string with undefined variable", () => {
			expect(() => execParseArgs({ vars }, ["Value: ${nonExistentVar}"])).toThrow(/unknown var "nonExistentVar"/);
		});

		it("should handle ArgVariable arguments", () => {
			const result = execParseArgs({ vars }, [new ArgVariable("myNum"), new ArgVariable("myString")]);
			expect(result).toEqual([123, "world"]);
		});

		it("should handle ArgVariable arguments pointing to object properties", () => {
			const result = execParseArgs({ vars }, [new ArgVariable("myObj.prop")]);
			expect(result).toEqual(["hello"]);
		});

		it("should handle ArgVariable for a non-existent variable", () => {
			expect(() => execParseArgs({ vars }, [new ArgVariable("nonExistentVar")])).toThrow(/unknown var "nonExistentVar"/);
		});

		it("should handle ArgIdentifier arguments", () => {
			const result = execParseArgs({ vars }, [new ArgIdentifier("id1"), new ArgIdentifier("id2")]);
			expect(result).toEqual(["id1", "id2"]);
		});

		it("should handle ArgColor arguments", () => {
			const result = execParseArgs({ vars }, [new ArgColor("#FF0000"), new ArgColor("blue")]);
			expect(result).toEqual(["#FF0000", "blue"]);
		});

		it("should handle ArgExpression arguments (processed by evalValue)", () => {
			const expr = new ArgExpression([new ArgVariable("a"), new ArgVariable("b"), "Plus"]); // 10 + 5 = 15
			const result = execParseArgs({ vars }, [expr]);
			expect(result).toEqual([15]);
		});

		it("should handle ValueTrait arguments (processed by evalValue, which calls execParseArgs recursively)", () => {
			const mockTraitInstance = { name: "MockTrait", type: "mock" };
			vi.spyOn(TraitFactory, "createTraitByName").mockReturnValue(mockTraitInstance as unknown as Trait);

			// ValueTrait args will be processed by the inner execParseArgs call
			const trait = new ValueTrait("MyTrait", [new ArgVariable("myNum"), "staticArg"]);
			const result = execParseArgs({ vars }, [trait]);

			expect(TraitFactory.createTraitByName).toHaveBeenCalledWith("MyTrait", 123, "staticArg");
			expect(result).toEqual([mockTraitInstance]);
		});

		it("should handle a mix of argument types", () => {
			vars.set("c", 2);
			const expr = new ArgExpression([new ArgVariable("myNum"), new ArgVariable("c"), "Multiply"]); // 123 * 2 = 246
			const mockTraitInstance = { name: "MixedTrait", type: "mock" };
			vi.spyOn(TraitFactory, "createTraitByName").mockReturnValue(mockTraitInstance as unknown as Trait);
			const trait = new ValueTrait("AnotherTrait", [50]);

			const fnArgs = [
				42,
				"Static string",
				"Interpolated: ${myString}",
				new ArgVariable("myNum"),
				new ArgIdentifier("someId"),
				new ArgColor("green"),
				expr,
				trait,
			];
			const result = execParseArgs({ vars }, fnArgs);
			expect(result).toEqual([42, "Static string", "Interpolated: world", 123, "someId", "green", 246, mockTraitInstance]);
			expect(TraitFactory.createTraitByName).toHaveBeenCalledWith("AnotherTrait", 50);
		});

		it("should handle boolean values passed directly (processed by evalValue)", () => {
			// Booleans fall into the `evalValue({ vars }, arg as TEvalValue)` path
			const result = execParseArgs({ vars }, [true, false]);
			expect(result).toEqual([true, false]);
		});
	});

	describe("execFnCall", () => {
		// Helper to call the internal (potentially unexported) function
		const callExecFnCall = (fnCallArgs: { name: string[]; args: unknown[] }, objSource: unknown) => {
			return execFnCall({ vars }, fnCallArgs, objSource);
		};

		it("should call a global function from vars", () => {
			const mockGlobalFunc = vi.fn((a, b) => a + b);
			vars.set("myGlobalFunc", mockGlobalFunc);
			const result = callExecFnCall({ name: ["myGlobalFunc"], args: [10, 5] }, null);
			expect(mockGlobalFunc).toHaveBeenCalledWith(10, 5);
			expect(result).toBe(15);
		});

		it("should call a method from object property", () => {
			// EntityPool("lifePool").get($count-1).bbox.setPosition($pos, 460)

			class TestClass {
				constructor(private num: number) {}
				method(a: number, b: number) {
					console.log("TestClass.method", this.num, a, b);
					return this.num + a + b;
				}
			}
			class Test2Class {
				public prop: TestClass;
				constructor(private num: number) {
					console.log("Test2Class()", this.num);
					this.prop = new TestClass(this.num);
				}
			}
			const obj = new Test2Class(2);
			vars.set("myObj", obj);

			// const mockGlobalFunc = vi.fn((a, b) => a + b);
			// vars.set("myGlobalFunc", mockGlobalFunc);
			const result = callExecFnCall({ name: ["myObj", "prop", "method"], args: [10, 5] }, null);
			// expect(mockGlobalFunc).toHaveBeenCalledWith(10, 5);
			expect(result).toBe(17);
		});

		// it("should correctly set 'this' for a global function from vars", () => {
		// 	let actualThis: unknown;
		// 	const mockGlobalFunc = vi.fn(function () {
		// 		actualThis = this;
		// 	});
		// 	vars.set("myGlobalFunc", mockGlobalFunc);

		// 	callExecFnCall({ name: ["myGlobalFunc"], args: [] }, null);
		// 	expect(actualThis).toBe(mockGlobalFunc);
		// });

		// it("should call a method on an object from vars", () => {
		// 	let actualThis: unknown;
		// 	const obj = {
		// 		val: "test_val",
		// 		method: vi.fn(function (arg: string) {
		// 			actualThis = this;
		// 			return `${this.val}-${arg}`;
		// 		}),
		// 	};
		// 	vars.set("myObj", obj);

		// 	const result = callExecFnCall({ name: ["myObj", "method"], args: ["arg1"] }, null);

		// 	expect(obj.method).toHaveBeenCalledWith("arg1");
		// 	expect(actualThis).toBe(obj);
		// 	expect(result).toBe("test_val-arg1");
		// });

		it("should handle 'this' context for deeply nested methods from vars (current behavior)", () => {
			class PlayerClass {
				id: string;
				constructor() {
					this.id = "id_player";
				}
				action(_a: number, _b: number) {
					return this.id;
				}
			}
			class GameClass {
				id: string;
				public player: PlayerClass;
				constructor() {
					this.id = "id_game";
					this.player = new PlayerClass();
				}
			}
			const gameObj = new GameClass();
			vars.set("game", gameObj);
			const result = callExecFnCall({ name: ["game", "player", "action"], args: [1, 2] }, null);
			expect(result).toBe("id_player");
		});

		// it("should call a method on a provided objSource", () => {
		// 	let actualThis: unknown;
		// 	const sourceObj = {
		// 		id: "source_id",
		// 		method: vi.fn(function () {
		// 			actualThis = this;
		// 			return this.id;
		// 		}),
		// 	};

		// 	const result = callExecFnCall({ name: ["method"], args: [] }, sourceObj);

		// 	expect(sourceObj.method).toHaveBeenCalled();
		// 	expect(actualThis).toBe(sourceObj);
		// 	expect(result).toBe("source_id");
		// });

		// it("should handle 'this' for deeply nested methods on provided objSource (current behavior)", () => {
		// 	let actualThisInDeepMethod: unknown;
		// 	const sourceObj = {
		// 		id: "source_obj_id",
		// 		prop: {
		// 			id: "prop_obj_id",
		// 			deepMethod: vi.fn(function () {
		// 				actualThisInDeepMethod = this;
		// 				return this.id; // Expects this to be sourceObj
		// 			}),
		// 		},
		// 	};

		// 	const result = callExecFnCall({ name: ["prop", "deepMethod"], args: [] }, sourceObj);

		// 	expect(sourceObj.prop.deepMethod).toHaveBeenCalled();
		// 	expect(actualThisInDeepMethod).toBe(sourceObj); // 'this' is sourceObj, not sourceObj.prop
		// 	expect(result).toBe("source_obj_id");
		// });

		it("should log an error and return undefined if function/method is not found (first part)", () => {
			const result = callExecFnCall({ name: ["nonExistentFunc"], args: [] }, null);
			expect(console.error).toHaveBeenCalledWith("unknown action !", "nonExistentFunc", []);
			expect(result).toBeUndefined();
		});

		it("should log an error and return undefined if method is not found (intermediate part)", () => {
			vars.set("myObj", { id: "obj" });
			const result = callExecFnCall({ name: ["myObj", "nonExistentProp", "method"], args: [] }, null);
			expect(console.error).toHaveBeenCalledWith("unknown action !", "myObj.nonExistentProp.method", []);
			expect(result).toBeUndefined();
		});

		it("should log an error and return undefined if method is not found (last part on objSource)", () => {
			const sourceObj = { id: "source" };
			const result = callExecFnCall({ name: ["nonExistentMethod"], args: [] }, sourceObj);
			expect(console.error).toHaveBeenCalledWith("unknown action !", "nonExistentMethod", []);
			expect(result).toBeUndefined();
		});

		it("should parse arguments using execParseArgs", () => {
			vars.set("numVar", 100);
			vars.set("strVar", "interpolated");
			const mockFunc = vi.fn((num, str) => `${num}-${str}`);
			vars.set("argFunc", mockFunc);

			const result = callExecFnCall(
				{
					name: ["argFunc"],
					args: [new ArgVariable("numVar"), "Value: ${strVar}"],
				},
				null,
			);

			expect(mockFunc).toHaveBeenCalledWith(100, "Value: interpolated");
			expect(result).toBe("100-Value: interpolated");
		});

		it("should handle calls with no arguments", () => {
			const mockNoArgFunc = vi.fn(() => "done");
			vars.set("noArgFunc", mockNoArgFunc);

			const result = callExecFnCall({ name: ["noArgFunc"], args: [] }, null);
			expect(mockNoArgFunc).toHaveBeenCalled();
			expect(result).toBe("done");
		});

		// it("should call objSource directly if fnCall.name is empty and objSource is a function", () => {
		// 	let actualThis: unknown;
		// 	const callableObjSource = vi.fn(function (arg: string) {
		// 		actualThis = this;
		// 		return `called_source_with_${arg}`;
		// 	});

		// 	const result = callExecFnCall({ name: [], args: ["hello"] }, callableObjSource);

		// 	expect(callableObjSource).toHaveBeenCalledWith("hello");
		// 	expect(actualThis).toBe(callableObjSource);
		// 	expect(result).toBe("called_source_with_hello");
		// });

		it("should throw if fnCall.name is empty and objSource is not a function", () => {
			const nonCallableObjSource = { message: "I am an object" };
			expect(() => {
				callExecFnCall({ name: [], args: [] }, nonCallableObjSource);
			}).toThrow(TypeError); // fn.call(self,...) will throw "fn is not a function"
		});
	});
});
