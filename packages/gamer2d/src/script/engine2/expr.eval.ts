import type { TFunctions } from "../../utils/functionDict.utils";
import type { TVars } from "../../utils/vars.utils";
import type { TNeatInstruction } from "../compiler2/types/value-types";

type EvalValue = number | string | boolean;

export function evalExpression(instructions: TNeatInstruction[], vars: TVars, functions: TFunctions): EvalValue {
	const stack: EvalValue[] = [];

	for (const instr of instructions) {
		switch (instr.type) {
			case "const": {
				stack.push(instr.value as EvalValue);
				break;
			}
			case "var": {
				stack.push(vars.get(instr.name) as EvalValue);
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
				const args = instr.args.map((arg) => evalExpression([arg], vars, functions));
				const result = functions.call(instr.name, args);
				stack.push(result as EvalValue);
				break;
			}
			default:
				throw new Error("Unknown instruction type");
		}
	}

	if (stack.length !== 1) throw new Error("Invalid expression: stack did not resolve to a single value");
	return stack[0];
}

/**
 * Evaluates a series of Neat instructions and ensures the result is a string.
 * Throws an error if the result is not a string.
 * @param instructions The array of instructions to evaluate.
 * @param vars The variables context.
 * @param functions The functions context.
 * @returns The string result of the expression.
 * @throws Error if the expression does not evaluate to a string.
 */
export function evalExpressionToString(instructions: TNeatInstruction[], vars: TVars, functions: TFunctions): string {
	const result = evalExpression(instructions, vars, functions);
	if (typeof result !== "string") {
		throw new Error(`Expression did not evaluate to a string. Got type: ${typeof result}, value: ${result}`);
	}
	return result;
}
