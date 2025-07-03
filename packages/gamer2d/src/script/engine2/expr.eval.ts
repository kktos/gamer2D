import type { TNeatExpression } from "../compiler2/types/expression.type";
import type { ExecutionContext } from "./exec.type";
import { interpolateString } from "./string.eval";

interface EvalArray extends Array<EvalValue> {}
interface EvalObject {
	[key: string]: EvalValue;
}
type EvalValue = number | string | boolean | EvalArray | EvalObject;

export function isConstExpression(instructions: TNeatExpression) {
	const hasVarOrFn = instructions.filter((inst) => inst.type === "var" || inst.type === "fn");
	return !hasVarOrFn;
}

export function evalExpression(instructions: TNeatExpression, context: ExecutionContext, varsUsed?: Set<string>): EvalValue {
	const stack: EvalValue[] = [];

	for (const instr of instructions) {
		switch (instr.type) {
			case "const": {
				stack.push(instr.value as EvalValue);
				break;
			}
			case "var": {
				if (varsUsed) varsUsed.add(instr.name);
				const value = context.variables.get(instr.name) as EvalValue;
				if (value === undefined) console.warn(`Variable '${instr.name}' is not defined`);
				stack.push(value);
				break;
			}
			case "op": {
				const b = stack.pop();
				const a = instr.op === "NEG" || instr.op === "PLUS" || instr.op === "!" ? undefined : stack.pop();

				switch (instr.op) {
					case "+": {
						if (typeof a === "number" && typeof b === "number") stack.push(a + b);
						else if (typeof a === "string" || typeof b === "string") stack.push(String(a) + String(b));
						else throw new Error("Invalid operands for Plus");
						break;
					}
					case "-": {
						if (typeof a !== "number" || typeof b !== "number") throw new Error(`Operands must be numbers for ${instr.op}`);
						stack.push(a - b);
						break;
					}
					case "/": {
						if (typeof a !== "number" || typeof b !== "number") throw new Error(`Operands must be numbers for ${instr.op}`);
						stack.push(a / b);
						break;
					}
					case "*": {
						if (typeof a !== "number" || typeof b !== "number") throw new Error(`Operands must be numbers for ${instr.op}`);
						stack.push(a * b);
						break;
					}
					case "%": {
						if (typeof a !== "number" || typeof b !== "number") throw new Error(`Operands must be numbers for ${instr.op}`);
						stack.push(a % b);
						break;
					}
					case "NEG": {
						if (typeof b !== "number") throw new Error("Operand must be a number for Negate");
						stack.push(-b);
						break;
					}
					case "PLUS": {
						if (typeof b !== "number") throw new Error("Operand must be a number for Posify");
						stack.push(b);
						break;
					}
					case "!": {
						if (typeof b !== "boolean") throw new Error("Operand must be a boolean for Not");
						stack.push(!b);
						break;
					}
					default:
						throw new Error(`Unknown op: ${instr.op}`);
				}
				break;
			}
			case "fn": {
				const args = instr.args.map((arg) => evalExpression(arg, context, varsUsed));
				const result = context.functions.call(context, instr.name, args);
				stack.push(result as EvalValue);
				break;
			}
			case "method": {
				const obj = stack.pop();
				if (obj === null || obj === undefined) throw new Error("Cannot access property of null or undefined");
				if (typeof obj !== "object" && !Array.isArray(obj)) throw new Error("Cannot access property of non-object value");

				const args = instr.args.map((arg) => {
					let result = evalExpression(arg, context, varsUsed);
					if (typeof result === "string") result = interpolateString(result, context, varsUsed);
					return result;
				});

				if (typeof obj[instr.name] !== "function") throw new Error(`Method '${instr.name}' does not exist on object`);

				const result = obj[instr.name](...args);
				stack.push(result as EvalValue);
				break;
			}
			case "array": {
				const arrayOfExpr = instr.value;
				const evaluatedArray = arrayOfExpr.map((expressionArray) => evalExpression(expressionArray, context, varsUsed));
				stack.push(evaluatedArray);
				break;
			}
			case "object": {
				const objectOfExpr: EvalObject = {};
				for (const [key, value] of Object.entries(instr.value)) {
					objectOfExpr[key] = evalExpression(value, context, varsUsed);
				}
				stack.push(objectOfExpr);
				break;
			}
			case "prop": {
				// Property access: object.property
				const property = stack.pop();
				const obj = stack.pop();

				if (typeof property !== "string" && typeof property !== "number") throw new Error("Property name must be a string or a number");

				if (obj === null || obj === undefined) throw new Error("Cannot access property of null or undefined");

				if (typeof obj !== "object" && !Array.isArray(obj)) throw new Error("Cannot access property of non-object value");

				const result = Array.isArray(obj) ? (obj as EvalArray)[property] : (obj as EvalObject)[property];
				if (result === undefined) throw new Error(`Property '${property}' does not exist on object`);

				stack.push(result);
				break;
			}
			default:
				throw new Error("Unknown instruction type");
		}
	}

	if (stack.length !== 1) throw new Error("Invalid expression: stack did not resolve to a single value");
	return stack[0];
}

export function evalExpressionAs(instructions: TNeatExpression, context: ExecutionContext, type: "string", varsUsed?: Set<string>): string;
export function evalExpressionAs(instructions: TNeatExpression, context: ExecutionContext, type: "number", varsUsed?: Set<string>): number;
export function evalExpressionAs(instructions: TNeatExpression, context: ExecutionContext, type: "boolean", varsUsed?: Set<string>): boolean;
export function evalExpressionAs(instructions: TNeatExpression, context: ExecutionContext, type: "array", varsUsed?: Set<string>): EvalArray;
export function evalExpressionAs(instructions: TNeatExpression, context: ExecutionContext, type: string, varsUsed?: Set<string>): unknown {
	const result = evalExpression(instructions, context, varsUsed);

	if (type === "array") {
		if (!Array.isArray(result)) throw new Error(`Expression did not evaluate to an array. Got type: ${typeof result}, value: ${result}`);
	}
	// biome-ignore lint/suspicious/useValidTypeof: this is valid, biome is lost here :)
	else if (typeof result !== type) throw new Error(`Expression did not evaluate to a ${type}. Got type: ${typeof result}, value: ${result}`);

	return result;
}
