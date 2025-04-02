// https://gist.github.com/Ely-S/4191458
export function clone<T>(original: T, duplicata = {}): T {
	for (const i in original) (duplicata as T)[i] = original[i] && typeof original[i] === "object" ? clone(original[i], original[i].constructor()) : original[i];
	return duplicata as T;
}
