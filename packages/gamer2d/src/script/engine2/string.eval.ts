import { compile } from "../compiler2/compiler";
import type { TNeatExpression } from "../compiler2/types/expression.type";
import type { ExecutionContext } from "./exec.type";
import { evalExpression } from "./expr.eval";

export function interpolateString(template: string, context: ExecutionContext, varsUsed?: Set<string>): string {
	return template.replace(/\$\{([^}]+)\}/g, (_match, expression) => {
		const exprStack = compile<TNeatExpression>(`${expression}`, "expression");
		return String(evalExpression(exprStack, context, varsUsed));
	});
}

export function isInterpolatedString(template: string) {
	return !!template.match(/\$\{([^}]+)\}/g);
}
