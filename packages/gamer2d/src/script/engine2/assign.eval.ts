import type { TFunctions } from "../../utils/functionDict.utils";
import type { TVars } from "../../utils/vars.utils";
import type { TNeatAssignCommand, TNeatInstructionVar } from "../compiler2/types/value-types";
import { evalExpression, evalExpressionToString } from "./expr.eval";

export function evalAssignment(command: TNeatAssignCommand, vars: TVars, functions: TFunctions): void {
	// Evaluate the expression to get the value to assign
	const valueToAssign = evalExpression(command.value, vars, functions);

	// Handle the assignment path
	const path = command.name;

	const rootVarName = (path[0] as TNeatInstructionVar).name;

	if (path.length === 1) {
		// Simple assignment: $var = value
		vars.set(rootVarName, valueToAssign);
		return;
	}

	// Complex assignment: $obj.prop = value or $obj.$var = value
	let current = vars.get(rootVarName);

	// Ensure root exists as an object
	if (current === undefined || current === null) {
		current = {};
		vars.set(rootVarName, current);
	}

	if (typeof current !== "object" || Array.isArray(current)) throw new Error(`Cannot assign property to non-object variable: ${rootVarName}`);

	// Navigate to the parent of the final property
	for (let i = 1; i < path.length - 1; i++) {
		const key = evalExpressionToString([path[i]], vars, functions);

		if (current[key] === null || current[key] === undefined) current[key] = {};

		if (typeof current[key] !== "object" || Array.isArray(current[key])) throw new Error(`Cannot access property '${key}' on non-object value`);

		current = current[key];
	}

	// Set the final property
	const finalKey = evalExpressionToString([path[path.length - 1]], vars, functions);
	current[finalKey] = valueToAssign;
}
