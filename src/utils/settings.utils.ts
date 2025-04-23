export type TSettings = {
	get: (key: string) => string;
	getNumber: (key: string) => number;
	has: (key: string) => boolean;
};
export function parseSettings(settings: string): TSettings {
	const settingsMap = settings
		.trim()
		.split("\n")
		.map((line: string) => line.trim())
		.filter((line: string) => line.length)
		.reduce((acc, curr) => {
			const [key, value] = curr.split(/\s*=\s*/);
			acc.set(key, value);
			return acc;
		}, new Map());
	return {
		get(key: string) {
			return settingsMap.get(key);
		},
		getNumber(key: string) {
			return Number(settingsMap.get(key));
		},
		has(key: string) {
			return settingsMap.has(key);
		},
	};
}
