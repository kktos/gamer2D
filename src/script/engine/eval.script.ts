import { createTrait } from "../../traits/Trait.factory";
import type { TResultValue, TVars } from "../../types/engine.types";
import { ArgColor, ArgExpression, ArgIdentifier, ArgVariable, ValueTrait } from "../../types/value.types";
import type { TFunctionArg } from "../compiler/layers/display/layout/action.rules";

export function isStringInterpolable(text: string) {
	if (typeof text !== "string") return false;
	return text.match(/\$\{(.+?)\}/) !== null;
}

export function interpolateString({ vars }: { vars: TVars }, text: string) {
	if (typeof text !== "string") {
		throw new TypeError("text must be a string !");
	}
	// return text.replaceAll(/\$\{(.+?)\}/g, (m, varname) => String(evalExpr({ vars }, `$${varname}`)));
	return text.replaceAll(/\$\{(.+?)\}/g, (m, varname) => String(evalVar({ vars }, varname)));
}

export function evalVar({ vars }: { vars: TVars }, varname: string) {
	const [name, ...parms] = varname.split(".");
	if (!vars.has(name)) {
		throw new TypeError(`unknown var "${name}"`);
	}

	let value = vars.get(name);
	if (value === undefined) {
		console.log(`undefined var "${name}"`, varname);
		return "";
	}

	for (let parmIdx = 0; parmIdx < parms.length; parmIdx++) {
		let parm = parms[parmIdx];

		if (parm.match(/^\$/)) {
			parm = String(vars.get(parm.substring(1)));
		}

		value = value?.[parm];

		if (value === undefined) {
			console.log(`undefined var "${parm}"`, varname);
			return "";
		}
	}

	if (value === undefined) {
		console.log("undefined var", varname);
		return "";
	}
	return value;
}

// const VARNAME_REGEX = /\$[a-zA-Z_][a-zA-Z0-9_]*(?:\.\$?[a-zA-Z_][a-zA-Z0-9_]*)*/g;
// export function oldEvalValue({ vars }: { vars: TVars }, varOrExpr: TResultValue[] | number | string | { expr: string } | ValueTrait): TVarTypes {
// 	if (Array.isArray(varOrExpr) || typeof varOrExpr === "number") return varOrExpr;

// 	if (typeof varOrExpr === "string") {
// 		if (varOrExpr.match(/^\$/)) return evalVar({ vars }, varOrExpr.substring(1));
// 		return interpolateString({ vars }, varOrExpr);
// 	}

// 	if (varOrExpr instanceof ValueTrait) {
// 		return createTrait(varOrExpr.name, ...varOrExpr.args);
// 	}

// 	const exprSrc = varOrExpr.expr;
// 	const expr = exprSrc.replaceAll(VARNAME_REGEX, (name) => evalVar({ vars }, name.substring(1)) as string);
// 	// biome-ignore lint/security/noGlobalEval: <explanation>
// 	return eval(expr);
// }

export function evalValue({ vars }: { vars: TVars }, expr: ArgExpression | ArgVariable | number | string | ValueTrait | TResultValue[]) {
	if (Array.isArray(expr) || typeof expr === "number") return expr;
	if (typeof expr === "string") return interpolateString({ vars }, expr);
	if (expr instanceof ArgVariable) return evalVar({ vars }, expr.value);
	if (expr instanceof ValueTrait) return createTrait(expr.name, ...expr.args);
	return evalExpr({ vars }, expr);
}

export function evalNumberValue({ vars }: { vars: TVars }, expr: unknown) {
	let result = expr;

	if (result instanceof ArgVariable) result = evalVar({ vars }, result.value);
	else if (result instanceof ArgExpression) result = evalExpr({ vars }, result);

	if (typeof result === "number") return result;

	throw new TypeError(`Not a Number value ${expr}`);
}

export function evalExpr({ vars }: { vars: TVars }, expr: ArgExpression) {
	let idx = 0;
	const args: number[] = [];
	while (idx < expr.stack.length) {
		let item: unknown = expr.stack[idx++];
		if (typeof item === "string") {
			const op2 = args.pop();
			const op1 = args.pop();
			if (op1 === undefined || op2 === undefined) throw new TypeError("evalExpr: needs 2 operands for operation");
			switch (item) {
				case "Plus":
					args.push(op1 + op2);
					break;
				case "Minus":
					args.push(op1 - op2);
					break;
				case "Multiply":
					args.push(op1 * op2);
					break;
				case "Divide":
					args.push(op1 / op2);
					break;
			}
			continue;
		}
		if (item instanceof ArgVariable) item = evalVar({ vars }, item.value);

		if (typeof item === "number") {
			args.push(item);
			continue;
		}
		throw new TypeError("evalExpr: needs 2 operands for operation");
	}
	return args[0];
}

export function evalNumber({ vars }, nameOrNumber: ArgVariable | number) {
	if (typeof nameOrNumber === "number") return nameOrNumber;
	return Number(evalVar({ vars }, nameOrNumber.value));
}

export function evalString({ vars }, nameOrString: ArgVariable | string) {
	if (typeof nameOrString === "string") return interpolateString({ vars }, nameOrString);
	return String(evalVar({ vars }, nameOrString.value));
}

export function typeOfArg(arg: TFunctionArg) {
	if (typeof arg === "number") return "number";
	if (typeof arg === "string") return "string";
	if (arg instanceof ArgVariable) return "variable";
	if (arg instanceof ArgIdentifier) return "identifier";
	if (arg instanceof ArgColor) return "color";
	return "unknown";
}

export function evalArg({ vars }, arg: TFunctionArg) {
	switch (typeOfArg(arg)) {
		case "number":
			return arg as number;
		case "string":
			return interpolateString({ vars }, arg as string);
		case "variable":
			return evalVar({ vars }, (arg as ArgVariable).value);
		case "identifier":
			return (arg as ArgIdentifier).value;
		case "color":
			return (arg as ArgColor).value;
		default:
			return null;
	}
}
