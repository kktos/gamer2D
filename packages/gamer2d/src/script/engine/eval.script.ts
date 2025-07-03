import { createTraitByName } from "../../traits/Trait.factory";
import type { TResultValue } from "../../types/engine.types";
import { ArgColor, ArgExpression, ArgIdentifier, ArgVariable, ValueTrait } from "../../types/value.types";
import type { TVarTypes, TVars } from "../../utils/vars.utils";
import type { TActionStatement, TFunctionArg } from "../compiler/shared/action.rules";
import { execAction, execParseArgs } from "./exec.script";

export function isStringInterpolable(text: string) {
	if (typeof text !== "string") return false;
	return text.match(/\$\{(.+?)\}/) !== null;
}

export function interpolateString({ vars }: { vars: TVars }, text: string) {
	if (typeof text !== "string") throw new TypeError("text must be a string !");
	return text.replaceAll(/\$\{(.+?)\}/g, (_m, varname) => String(evalVar({ vars }, varname)));
}

type TResolvedVar =
	| { value: TVarTypes; prop: string; isObject: true }
	| { value?: TVarTypes; prop: string; isObject?: false }
	| { value: undefined; isObject?: false };

export function resoleVar({ vars }: { vars: TVars }, varname: string): TResolvedVar {
	const [name, ...parms] = varname.split(".");
	if (!vars.has(name)) throw new TypeError(`unknown var "${name}"`);

	let value = vars.get(name);
	if (parms.length < 1) return { value, prop: name };

	for (let parmIdx = 0; parmIdx < parms.length - 1; parmIdx++) {
		let parm = parms[parmIdx];
		if (parm.match(/^\$/)) parm = String(vars.get(parm.substring(1)));
		value = value?.[parm];
		if (value === undefined) return { value };
	}
	if (value === undefined) return { value };
	let prop = parms.at(-1) as string;

	switch (prop) {
		case "int":
			return { value: Math.floor(Number(value)), prop: name };
	}

	if (prop?.match(/^\$/)) prop = String(vars.get(prop.substring(1)));
	return { value, prop, isObject: true };
}

export function evalVar({ vars }: { vars: TVars }, varname: string) {
	const result = resoleVar({ vars }, varname);
	if (result.value === undefined) {
		console.log(`undefined var "${varname}"`);
		return "";
	}
	const value = result.isObject ? result.value[result.prop] : result.value;
	if (value === undefined) {
		console.log(`undefined var "${varname}"`);
		return "";
	}
	return value;
}

export type TEvalValue = ArgExpression | ArgVariable | number | boolean | string | ValueTrait | TResultValue[] | { action: unknown };

export function evalValue({ vars }: { vars: TVars }, expr: TEvalValue) {
	if (Array.isArray(expr) || typeof expr === "number" || typeof expr === "boolean") return expr;
	if (typeof expr === "string") return interpolateString({ vars }, expr);
	if (expr instanceof ArgVariable) return evalVar({ vars }, expr.value);
	if (expr instanceof ValueTrait) {
		const args = execParseArgs({ vars }, expr.args);
		return createTraitByName(expr.name, ...args);
	}
	if (expr instanceof ArgExpression) return evalExpr({ vars }, expr);
	if (expr.action) return execAction({ vars }, expr.action as TActionStatement[]);
	throw new TypeError(`Unknown type value ${expr}`);
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
				case "Modulo":
					args.push(op1 % op2);
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
