import { loadJson, loadText } from "../utils/loaders.util";
import type { TSettings } from "../utils/settings.utils";
import Audio from "./Audio";
import Font from "./Font";
import type { GameOptions } from "./Game";
import { SpriteSheet } from "./Spritesheet";

type TResourceKind = "sprite" | "audio" | "font";
export default class ResourceManager {
	private cache: Map<string, unknown>;

	constructor(
		private gameOptions: GameOptions,
		public settings: TSettings,
	) {
		this.cache = new Map();
	}

	get mainFontName() {
		return this.settings.get("FONT.MAIN");
	}

	async load(resourcesFilename: string) {
		const sheet = (await loadJson(resourcesFilename)) as Record<string, string[]>;

		const jobs: Promise<unknown>[] = [];
		let resource: Promise<unknown>[] = [];
		for (const [kind, value] of Object.entries(sheet)) {
			switch (kind) {
				case "spritesheets":
					resource = this.loadSpritesheets(value, this.gameOptions.paths.spritesheets);
					break;
				case "audiosheets":
					resource = this.loadAudiosheets(value, this.gameOptions.paths, this.settings);
					break;
				case "fonts":
					resource = this.loadFonts(value, this.gameOptions.paths.fonts);
					break;
			}
			jobs.push(...resource);
		}

		return Promise.all(jobs);
	}

	private loadSpritesheets(sheets: string[], path: string) {
		return sheets.map((filename) =>
			SpriteSheet.load(`${path}/${filename}`)
				.catch((err) => console.error(`SpriteSheet.load ${filename}`, err))
				.then((r) => this.add("sprite", filename, r)),
		);
	}

	private loadAudiosheets(sheets: string[], paths: GameOptions["paths"], settings: TSettings) {
		return sheets.map((filename) =>
			Audio.load(`${paths.audiosheets}/${filename}`, settings)
				.catch((err) => console.error(`Audio.load ${filename}`, err))
				.then((r) => this.add("audio", filename, r)),
		);
	}

	private loadFonts(sheets: string[], path: string) {
		return sheets.map((filename: string) => {
			const promise = Font.load(`${path}/${filename}`);
			promise.catch((err) => console.error(`Font.load ${filename}`, err));
			promise.then((r) => this.add("font", r.name, r));
			return promise;
		});
	}

	async loadScene(name: string) {
		return loadText(`${this.gameOptions.paths.scenes}/${name}.script`);
	}

	add(kind: TResourceKind, name: string, rez) {
		const id = `${kind}:${name}`.replace(/\.json/, "");
		if (this.cache.has(id)) throw new Error(`Duplicate resource ${id}!`);
		console.log(`ResourceManager.add(${id})`);
		this.cache.set(id, rez);
	}

	get<T>(kind: string, name?: string) {
		const id = name ? `${kind}:${name}` : kind;
		if (!this.cache.has(id)) throw new Error(`Unable to find resource ${id}!`);
		return this.cache.get(id) as T;
	}

	byKind(kind: TResourceKind) {
		const re = new RegExp(`^${kind}:`);
		return [...this.cache.keys()].filter((k) => k.match(re));
	}
}
