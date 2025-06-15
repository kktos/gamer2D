import type { ExecutionContext } from "./exec.type";

export function interpolateString(template: string, context: ExecutionContext): string {
	// Handle different interpolation patterns
	// ${variable} - simple variable substitution
	// ${expression} - more complex expressions (if needed later)

	return template.replace(/\$\{([^}]+)\}/g, (match, expression) => {
		const trimmed = expression.trim();

		// Simple variable lookup
		if (context.variables.has(trimmed)) {
			const value = context.variables.get(trimmed);
			return String(value);
		}

		// If you want to support more complex expressions later,
		// you could parse and evaluate them here using your instruction system

		// For now, throw error for unknown variables
		throw new Error(`Unknown variable in string interpolation: ${trimmed}`);
	});
}
