import { ArgColor, ArgExpression, ArgIdentifier, ArgVariable, ValueTrait } from "../types/value.types";

// https://gist.github.com/Ely-S/4191458
export function clone<T>(original: T, duplicata: Record<string, unknown> = {}): T {
	for (const i in original) {
		if (original[i] && typeof original[i] === "object") {
			if (original[i] instanceof ArgColor) {
				duplicata[i] = new ArgColor(original[i].value);
				continue;
			}
			if (original[i] instanceof ArgVariable) {
				duplicata[i] = new ArgVariable(original[i].value);
				continue;
			}
			if (original[i] instanceof ArgIdentifier) {
				duplicata[i] = new ArgIdentifier(original[i].value);
				continue;
			}
			if (original[i] instanceof ArgExpression) {
				duplicata[i] = new ArgExpression(original[i].stack);
				continue;
			}
			if (original[i] instanceof ValueTrait) {
				duplicata[i] = new ValueTrait(original[i].name, [...original[i].args]);
				continue;
			}
			(duplicata as T)[i] = clone(original[i], original[i].constructor());
		} else {
			(duplicata as T)[i] = original[i];
		}

		// (duplicata as T)[i] = original[i] && typeof original[i] === "object" ? clone(original[i], original[i].constructor()) : original[i];
	}
	return duplicata as T;
}

export function getClassName(classType: unknown) {
	let name = "";
	if (typeof classType === "object") name = String(classType?.constructor);
	else name = String(classType);
	const m = name.match(/class ([^\s]+)/);
	if (!m) throw new TypeError("Unable to retrieve classname from class !?!");
	return m[1];
}
