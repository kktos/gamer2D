import type { TNeatAssignCommand } from "../../compiler2/types/commands.type";
import type { TNeatVarTerm } from "../../compiler2/types/expression.type";
import type { ExecutionContext } from "../exec.context";
import { evalExpression, evalExpressionAs } from "../expr.eval";

export function executeAssignmentCommand(command: TNeatAssignCommand, context: ExecutionContext): void {
	// Evaluate the expression to get the value to assign
	const valueToAssign = evalExpression(command.value, context);

	// Handle the assignment path
	const path = command.name.filter((part) => part.type !== "prop");

	const rootVarName = (path[0] as TNeatVarTerm).name;

	if (path.length === 1) {
		// Simple assignment: $var = value
		if (command.isConst) context.variables.setStaticLocal(rootVarName, valueToAssign);
		else context.variables.set(rootVarName, valueToAssign);
		return;
	}

	// Complex assignment: $obj.prop = value or $obj.$var = value
	let current = context.variables.get(rootVarName) as Record<string, unknown>;

	// Ensure root exists as an object
	if (current === undefined || current === null) {
		current = {};
		context.variables.set(rootVarName, current);
	}

	if (typeof current !== "object" || Array.isArray(current)) throw new Error(`Cannot assign property to non-object variable: ${rootVarName}`);

	// Navigate to the parent of the final property
	for (let i = 1; i < path.length - 1; i++) {
		const key = evalExpressionAs([path[i]], context, "string");

		if (current[key] === null || current[key] === undefined) current[key] = {};

		if (typeof current[key] !== "object" || Array.isArray(current[key])) throw new Error(`Cannot access property '${key}' on non-object value`);

		current = current[key] as Record<string, unknown>;
	}

	// Set the final property
	const finalKey = evalExpressionAs([path[path.length - 1]], context, "string");
	current[finalKey] = valueToAssign;
}
