import { loadJson, loadText } from "../utils/loaders.util";
import Audio from "./Audio";
import Font from "./Font";
import type { GameOptions } from "./Game";
import { SpriteSheet } from "./Spritesheet";

export default class ResourceManager {
	private cache: Map<string, unknown>;
	private options: GameOptions;

	constructor(gameOptions: GameOptions) {
		this.cache = new Map();
		this.options = gameOptions;
	}

	async load(resourcesFilename: string) {
		const sheet = (await loadJson(resourcesFilename)) as Record<string, string[]>;

		const jobs: Promise<unknown>[] = [];
		let resource: Promise<unknown>[] = [];
		for (const [kind, value] of Object.entries(sheet)) {
			switch (kind) {
				case "spritesheets":
					resource = this.loadSpritesheets(value);
					break;
				case "audiosheets":
					resource = this.loadAudiosheets(value);
					break;
				case "fonts":
					resource = this.loadFonts(value);
					break;
			}
			jobs.push(...resource);
		}

		return Promise.all(jobs);
	}

	private loadSpritesheets(sheets: string[]) {
		return sheets.map((filename) =>
			SpriteSheet.load(this.options.paths.spritesheets + filename)
				.catch((err) => console.error(`SpriteSheet.load ${filename}`, err))
				.then((r) => this.add("sprite", filename, r)),
		);
	}

	private loadAudiosheets(sheets: string[]) {
		return sheets.map((filename) =>
			Audio.load(this.options.paths.audiosheets + filename)
				.catch((err) => console.error(`Audio.load ${filename}`, err))
				.then((r) => this.add("audio", filename, r)),
		);
	}

	private loadFonts(sheets: string[]) {
		return sheets.map((filename: string) => {
			const promise = Font.load(this.options.paths.fonts + filename);
			promise.catch((err) => console.error(`Font.load ${filename}`, err));
			promise.then((r) => this.add("font", r.name, r));
			return promise;
		});
	}

	async loadScene(name: string) {
		return loadText(`${this.options.paths.scenes}${name}.script`);
	}

	add(kind: string, name: string, rez) {
		const id = `${kind}:${name}`.replace(/\.json/, "");
		if (this.cache.has(id)) throw new Error(`Duplicate resource ${id}!`);
		console.log(`ResourceManager.add(${id})`);
		this.cache.set(id, rez);
	}

	get(kind: string, name?: string) {
		const id = name ? `${kind}:${name}` : kind;
		if (!this.cache.has(id)) throw new Error(`Unable to find resource ${id}!`);
		return this.cache.get(id);
	}

	byKind(kind: string) {
		const re = new RegExp(`^${kind}:`);
		return [...this.cache.keys()].filter((k) => k.match(re));
	}
}
