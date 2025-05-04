import { ArgColor, ArgIdentifier, ArgVariable } from "../../types/value.types";
import type { TVars } from "../../utils/vars.utils";
import type { TActionStatement } from "../compiler/layers/display/layout/action.rules";
import type { TSet } from "../compiler/layers/display/layout/set.rules";
import { evalValue, evalVar, interpolateString, isStringInterpolable, resoleVar } from "./eval.script";

function execFnCall({ vars }: { vars: TVars }, fnCall, objSource) {
	const args: unknown[] = [];

	for (const arg of fnCall.args) {
		if (typeof arg === "number") {
			args.push(arg);
			continue;
		}
		if (typeof arg === "string") {
			args.push(isStringInterpolable(arg) ? interpolateString({ vars }, arg) : arg);
			continue;
		}
		if (arg instanceof ArgVariable) {
			args.push(evalVar({ vars }, arg.value));
			continue;
		}
		if (arg instanceof ArgIdentifier) {
			args.push(arg.value);
			continue;
		}
		if (arg instanceof ArgColor) {
			args.push(arg.value);
			continue;
		}
		args.push(evalValue({ vars }, arg));
	}

	let self = objSource;
	let fn = self;
	for (let partIdx = 0; partIdx < fnCall.name.length; partIdx++) {
		const part = fnCall.name[partIdx];
		if (!self) {
			self = vars.get(part);
			fn = self;
		} else {
			fn = fn[part];
		}
		if (!fn) {
			console.error("unknown action !", fnCall.name.join("."), args);
			return;
		}
	}

	return fn.call(self, ...args);
}

export function execSet({ vars }: { vars: TVars }, actionSet: TSet) {
	const result = resoleVar({ vars }, actionSet.name);
	if (result.value === undefined) {
		console.log(`undefined var "${actionSet.name}"`);
		return "";
	}
	const value = evalValue({ vars }, actionSet.value);
	if (result.isObject) result.value[result.prop] = value;
	else vars.set(result.prop, value);
}

export function execAction({ vars }: { vars: TVars }, statementList: TActionStatement[]) {
	for (const statement of statementList) {
		if (Array.isArray(statement)) {
			let result = undefined;
			for (const fnCall of statement) {
				result = execFnCall({ vars }, fnCall, result);
			}
		} else execSet({ vars }, statement);
	}
}
