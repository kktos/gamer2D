import { compile } from "../script/compiler2/compiler";
import type { TNeatSettingsCommand } from "../script/compiler2/types/commands.type";

export function parseSettings(settings: string) {
	const settingsScript = `settings {${settings}}`;
	const values = compile<TNeatSettingsCommand>(settingsScript, "settings").value;
	return {
		get<T>(key: string) {
			const parts = key.split(".");
			let obj = values as unknown;
			for (let i = 0; i < parts.length; i++) {
				if (typeof obj !== "object") return undefined;
				if (obj === null) return null;
				obj = obj[parts[i]] as Record<string, unknown>;
			}
			return obj as T;
		},
	};
}
