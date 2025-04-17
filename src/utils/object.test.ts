import { describe, expect, it } from "vitest";
import { ArgColor, ArgIdentifier, ArgVariable } from "../types/value.types";
import { clone } from "./object.util";

describe("Object Cloning", () => {
	it("should clone with special types", () => {
		const objToClone = {
			num: 10,
			text: "hello",
			bool: true,
			color: new ArgColor("#11223344"),
			id: new ArgIdentifier("id"),
			var: new ArgVariable("var"),
		};

		const cloneObject = clone(objToClone);

		expect(cloneObject).toBeDefined();

		expect(cloneObject).toEqual({
			num: 10,
			text: "hello",
			bool: true,
			color: new ArgColor("#11223344"),
			id: new ArgIdentifier("id"),
			var: new ArgVariable("var"),
		});
	});

	it("should clone with array", () => {
		const objToClone = {
			num: 10,
			items: [1, 2, 3],
		};

		const cloneObject = clone(objToClone);

		expect(cloneObject).toBeDefined();

		expect(cloneObject).toEqual({
			num: 10,
			items: [1, 2, 3],
		});
	});
});
