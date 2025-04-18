import { ArgColor, ArgIdentifier, ArgVariable } from "../types/value.types";

// https://gist.github.com/Ely-S/4191458
export function clone<T>(original: T, duplicata: Record<string, unknown> = {}): T {
	for (const i in original) {
		if (original[i] && typeof original[i] === "object") {
			if (original[i] instanceof ArgColor) {
				const col = new ArgColor(original[i].value);
				duplicata[i] = col;
				continue;
			}
			if (original[i] instanceof ArgVariable) {
				const col = new ArgVariable(original[i].value);
				duplicata[i] = col;
				continue;
			}
			if (original[i] instanceof ArgIdentifier) {
				const col = new ArgIdentifier(original[i].value);
				duplicata[i] = col;
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
