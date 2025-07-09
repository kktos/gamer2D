import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Since this is an ES module, __dirname is not available.
// We can create it like this.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fixPackageJsonExports() {
	const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
	console.log(`Fixing exports in: ${packageJsonPath}`);

	try {
		const packageJsonContent = await readFile(packageJsonPath, 'utf-8');
		const packageData = JSON.parse(packageJsonContent);

		if (!packageData.exports) {
			console.log('No "exports" field found. Nothing to do.');
			return;
		}

		const originalExports = packageData.exports;
		const newExports = {};
		let changesMade = false;

		for (const key in originalExports) {
			const value = originalExports[key];

			// 1. Fix path separators in the key (e.g., ".\foo\bar" -> "./foo/bar")
			const fixedKey = key.replace(/\\/g, '/');
			if (key !== fixedKey) changesMade = true;

			// 2. Check if the value is a string, which needs to be converted to the object format
			if (typeof value === 'string') {
				changesMade = true;
				const importPath = value.replace(/\\/g, '/');
				const typesPath = importPath.replace(/\.js$/, '.d.ts');

				newExports[fixedKey] = {
					types: typesPath,
					import: importPath,
				};
			} else {
				// It's already an object or some other value, just copy it to the new key
				newExports[fixedKey] = value;
			}
		}

		if (changesMade) {
			packageData.exports = newExports;
			// The last argument to stringify adds indentation and newlines, making it readable.
			const updatedPackageJsonContent = JSON.stringify(packageData, null, '\t');
			await writeFile(packageJsonPath, updatedPackageJsonContent + '\n', 'utf-8');
			console.log('Successfully fixed the "exports" map in package.json.');
		} else {
			console.log('The "exports" map is already in the correct format. No changes needed.');
		}
	} catch (error) {
		console.error('Failed to fix package.json exports:', error);
		process.exit(1); // Exit with an error code
	}
}

fixPackageJsonExports();

