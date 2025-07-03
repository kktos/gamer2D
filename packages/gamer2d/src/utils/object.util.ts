import { TText } from "../script/compiler/layers/display/layout/text.rules";
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
			if (original[i] instanceof TText) {
				// duplicata[i] = new TText(original[i].text);
				(duplicata as T)[i] = clone(original[i], new TText(original[i].text) as unknown as Record<string, unknown>);
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

// TODO: remove when new version will be fully tested
export function OLD_getClassName(classType: unknown) {
	let name = "";
	if (typeof classType === "object") {
		name = String(classType?.constructor);
		const m = name.match(/class ([^\s]+)/);
		if (!m) throw new TypeError("Unable to retrieve classname from class !?!");
		return m[1];
	}
	if (typeof classType === "function") {
		return classType.name;
	}
	throw new TypeError("Unable to retrieve classname from class !?!");
}

/**
 * Retrieves the class name from a class constructor or an instance of a class.
 * This function is more robust than parsing the string representation of the constructor.
 *
 * @param classOrInstance The class constructor (e.g., `MyClass`) or an instance of it (e.g., `new MyClass()`).
 * @returns The name of the class as a string.
 * @throws {TypeError} If the class name cannot be determined from the provided value.
 */
export function getClassName(classOrInstance: unknown): string {
	if (typeof classOrInstance === "function") {
		// Handles class constructors (e.g., `getClassName(MyClass)`)
		if (classOrInstance.name) {
			return classOrInstance.name;
		}
	} else if (typeof classOrInstance === "object" && classOrInstance !== null) {
		// Handles class instances (e.g., `getClassName(new MyClass())`)
		const constructorFn = classOrInstance.constructor;
		if (constructorFn?.name) {
			return constructorFn.name;
		}
	}

	throw new TypeError(`Unable to retrieve class name from the provided value: ${String(classOrInstance)}`);
}
