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
