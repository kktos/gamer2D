import type { TNeatExpression, TNeatTerm } from "../compiler2/types/expression.type";
import type { ExecutionContext } from "./exec.type";

interface EvalArray extends Array<EvalValue> {}
interface EvalObject {
	[key: string]: EvalValue;
}
type EvalValue = number | string | boolean | EvalArray | EvalObject;

export function evalExpression(instructions: TNeatExpression, context: ExecutionContext): EvalValue {
	const stack: EvalValue[] = [];

	for (const instr of instructions) {
		switch (instr.type) {
			case "const": {
				stack.push(instr.value as EvalValue);
				break;
			}
			case "var": {
				stack.push(context.variables.get(instr.name) as EvalValue);
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
						if (typeof b === "number") stack.push(-b);
						else throw new Error("Operand must be a number for Negate");
						break;
					}
					case "PLUS": {
						if (typeof b === "number") stack.push(+b);
						else throw new Error("Operand must be a number for Posify");
						break;
					}
					case "!": {
						if (typeof b === "boolean") stack.push(!b);
						else throw new Error("Operand must be a boolean for Not");
						break;
					}
					default:
						throw new Error(`Unknown op: ${instr.op}`);
				}
				break;
			}
			case "fn": {
				const args = instr.args.map((arg) => evalExpression(arg, context));
				const result = context.functions.call(instr.name, args);
				stack.push(result as EvalValue);
				break;
			}
			case "array": {
				const arrayOfExpr = instr.value;
				const evaluatedArray = arrayOfExpr.map((expressionArray) => evalExpression(expressionArray, context));
				stack.push(evaluatedArray);
				break;
			}
			case "object": {
				const objectOfExpr: EvalObject = {};
				for (const [key, value] of Object.entries(instr.value)) {
					objectOfExpr[key] = evalExpression(value, context);
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

export function evalExpressionAs(instructions: TNeatTerm[], context: ExecutionContext, type: "string"): string;
export function evalExpressionAs(instructions: TNeatTerm[], context: ExecutionContext, type: "number"): number;
export function evalExpressionAs(instructions: TNeatTerm[], context: ExecutionContext, type: "boolean"): boolean;
export function evalExpressionAs(instructions: TNeatTerm[], context: ExecutionContext, type: "array"): EvalArray;
export function evalExpressionAs(instructions: TNeatTerm[], context: ExecutionContext, type: string): unknown {
	const result = evalExpression(instructions, context);

	if (type === "array") {
		if (!Array.isArray(result)) throw new Error(`Expression did not evaluate to an array. Got type: ${typeof result}, value: ${result}`);
	}
	// biome-ignore lint/suspicious/useValidTypeof: this is valid, biome is lost here :)
	else if (typeof result !== type) throw new Error(`Expression did not evaluate to a ${type}. Got type: ${typeof result}, value: ${result}`);

	return result;
}
