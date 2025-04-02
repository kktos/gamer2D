import { loadJson } from "../utils/loaders.util";
import Audio from "./Audio";
import Font from "./Font";
import { SpriteSheet } from "./Spritesheet";

function loadSpritesheets(mgr: ResourceManager, sheets: string[]) {
	return sheets.map((filename) =>
		SpriteSheet.load(filename)
			.catch((err) => console.error(`SpriteSheet.load ${filename}`, err))
			.then((r) => mgr.add("sprite", filename, r)),
	);
}

function loadAudiosheets(mgr: ResourceManager, sheets: string[]) {
	return sheets.map((filename) =>
		Audio.load(filename)
			.catch((err) => console.error(`Audio.load ${filename}`, err))
			.then((r) => mgr.add("audio", filename, r)),
	);
}

function loadFonts(mgr: ResourceManager, sheets: string[]) {
	return sheets.map((filename: string) => {
		const promise = Font.load(filename);
		promise.catch((err) => console.error(`Font.load ${filename}`, err));
		promise.then((r) => mgr.add("font", r.name, r));
		return promise;
	});
}

export default class ResourceManager {
	private cache: Map<string, unknown>;

	constructor() {
		this.cache = new Map();
	}

	async load(resourcesFilename: string) {
		const sheet = (await loadJson(resourcesFilename)) as Record<string, string[]>;

		const jobs: Promise<unknown>[] = [];
		let resource: Promise<unknown>[] = [];
		for (const [kind, value] of Object.entries(sheet)) {
			switch (kind) {
				case "spritesheets":
					resource = loadSpritesheets(this, value);
					break;
				case "audiosheets":
					resource = loadAudiosheets(this, value);
					break;
				case "fonts":
					resource = loadFonts(this, value);
					break;
			}
			jobs.push(...resource);
		}

		return Promise.all(jobs);
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
