import type { TVars } from "../../types/engine.types";
import { evalExpr, interpolateString } from "./eval.script";

function execFnCall({ vars }: { vars: TVars }, fnCall, objSource) {
	const args: unknown[] = [];

	for (const arg of fnCall.args) {
		if (typeof arg === "number") {
			args.push(arg);
			continue;
		}
		const strMatches = arg.match(/^"(.*)"$/);
		if (strMatches) {
			args.push(interpolateString({ vars }, strMatches[1]));
			continue;
		}
		args.push(evalExpr({ vars }, arg));
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

export function execAction({ vars }: { vars: TVars }, statementList) {
	let result = undefined;
	for (const statement of statementList) {
		for (const fnCall of statement) {
			result = execFnCall({ vars }, fnCall, result);
		}
	}
	return result;
}
