import type { TSpriteSheet } from "../script/compiler/ressources/spritesheet.rules";
import { loadJson, loadText } from "../utils/loaders.util";
import type { TSettings } from "../utils/settings.utils";
import Audio, { loadSounds } from "./Audio";
import { Font, type TFontSheet, loadFontData } from "./Font";
import { SpriteSheet } from "./Spritesheet";
import type { GameOptions } from "./types/GameOptions";

type TResourceKind = "sprite" | "audio" | "font";
type TResourceGroupNames = "spritesheets" | "audiosheets" | "fonts";
export type TResourceGroupsDict = Partial<Record<TResourceGroupNames, (string | unknown)[]>>;

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

	private loadAudiosheets(sheets: (string | unknown)[], paths: GameOptions["paths"], settings: TSettings) {
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
			promise.catch((err) => {
				console.error(`Font.load ${filename}`, err);
			});
			promise.then((r) => {
				if (!(r instanceof Font)) throw new TypeError("Can't load font");
				this.add("font", r.name, r);
			});

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
