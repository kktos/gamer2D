import type { TFontSheet } from "../script/compiler2/rules/ressources/font.rule";
import type { TSpriteSheet } from "../script/compiler2/rules/ressources/spritesheet.rule";
import { loadJson, loadText } from "../utils/loaders.util";
import type { TNeatSettings } from "../utils/settings.utils";
import { Audio, loadSounds } from "./Audio";
import { Font, loadFontData } from "./Font";
import { SpriteSheet } from "./Spritesheet";
import type { GameOptions } from "./types/GameOptions";

type TResourceKind = "sprite" | "audio" | "font";
type TResourceGroupNames = "spritesheets" | "audiosheets" | "fonts";
export type TResourceGroupsDict = Partial<Record<TResourceGroupNames, (string | unknown)[]>>;

export class ResourceManager {
	static readonly cache: Map<string, unknown> = new Map();

	static addResource(kind: TResourceKind, name: string, rez) {
		const id = `${kind}:${name}`.replace(/\.json/, "");
		if (ResourceManager.cache.has(id)) throw new Error(`Duplicate resource ${id}!`);
		console.log(`ResourceManager.add(${id})`);
		ResourceManager.cache.set(id, rez);
	}

	static getResource<T>(kind: string, name?: string) {
		const id = name ? `${kind}:${name}` : kind;
		if (!ResourceManager.cache.has(id)) throw new Error(`Unable to find resource ${id}!`);
		return ResourceManager.cache.get(id) as T;
	}

	static getSpritesheet(name: string) {
		const id = `sprite:${name}`;
		if (!ResourceManager.cache.has(id)) throw new Error(`Unable to find resource ${id}!`);
		return ResourceManager.cache.get(id) as SpriteSheet;
	}

	// static byKind(kind: TResourceKind) {
	// 	const re = new RegExp(`^${kind}:`);
	// 	return [...ResourceManager.cache.keys()].filter((k) => k.match(re));
	// }

	constructor(
		private gameOptions: GameOptions,
		public settings: TNeatSettings,
	) {}

	async load(resources: string | TResourceGroupsDict) {
		let sheet: TResourceGroupsDict;
		if (typeof resources === "string") sheet = (await loadJson(resources)) as TResourceGroupsDict;
		else sheet = resources;

		const jobs: Promise<unknown>[] = [];
		let resource: Promise<unknown>[] = [];
		for (const [kind, value] of Object.entries(sheet)) {
			switch (kind) {
				case "spritesheets":
					resource = this.loadSpritesheets(value as (string | TSpriteSheet)[], this.gameOptions.paths.spritesheets);
					break;
				case "audiosheets":
					resource = this.loadAudiosheets(value as (string | unknown)[], this.gameOptions.paths, this.settings);
					break;
				case "fonts":
					resource = this.loadFonts(value as (string | TFontSheet)[], this.gameOptions.paths.fonts);
					break;
			}
			jobs.push(...resource);
		}

		return Promise.all(jobs);
	}

	private loadSpritesheets(sheets: (string | TSpriteSheet)[], path: string) {
		return sheets.map((filename) => {
			let promise: Promise<SpriteSheet>;
			if (typeof filename === "string") promise = SpriteSheet.loadScript(`${path}/${filename}`);
			else promise = SpriteSheet.loadData(filename);

			// promise.catch((err) => console.error(`SpriteSheet.load ${filename}`, err));
			promise.then((r) => this.add("sprite", r.name, r));
			return promise;
		});
	}

	private loadAudiosheets(sheets: (string | unknown)[], paths: GameOptions["paths"], settings: TNeatSettings) {
		return sheets.map((filename) => {
			let promise: Promise<Audio>;
			if (typeof filename === "string") promise = Audio.load(`${paths.audiosheets}/${filename}`, settings);
			else promise = loadSounds(filename, settings);

			promise.catch((err) => console.error(`Audio.load ${filename}`, err));
			promise.then((r) => this.add("audio", r.name, r));
			return promise;
		});
	}

	private loadFonts(sheets: (string | TFontSheet)[], path: string) {
		return sheets.map((filename: string | TFontSheet) => {
			let promise: Promise<Font | unknown>;

			if (typeof filename === "string") promise = Font.load(`${path}/${filename}`);
			else promise = loadFontData(filename);

			promise.then((r) => {
				if (!(r instanceof Font)) throw new TypeError("Can't load font");
				this.add("font", r.name, r);
			});
			promise.catch((err) => console.error(`Font.load ${filename}`, err));

			return promise;
		});
	}

	async loadScene(name: string) {
		return loadText(`${this.gameOptions.paths.scenes}/${name}.script`);
	}

	add(kind: TResourceKind, name: string, rez) {
		ResourceManager.addResource(kind, name, rez);
	}

	get<T>(kind: string, name?: string) {
		return ResourceManager.getResource<T>(kind, name);
	}

	byKind(kind: TResourceKind) {
		const re = new RegExp(`^${kind}:`);
		return [...ResourceManager.cache.keys()].filter((k) => k.match(re));
	}
}
