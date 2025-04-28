import type { Entity } from "../../entities/Entity";
import type { Layer } from "../../layers/Layer";
import type { Grid } from "../../maths/grid.math";
import type { Scene } from "../../scene/Scene";
import type { Trait } from "../../traits/Trait";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type EntityConstructor = new (...args: any[]) => Entity;
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type TraitConstructor = new (...args: any[]) => Trait;
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type SceneConstructor = new (...args: any[]) => Scene;
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type LayerConstructor = new (...args: any[]) => Layer;

export type entityDefinition = { name: string; classType: EntityConstructor };

export type GameOptions = {
	paths: {
		spritesheets: string;
		audiosheets: string;
		fonts: string;
		scenes: string;
		levels: string;
	};
	entities?: entityDefinition[];
	traits?: TraitConstructor[];
	layers?: LayerConstructor[];

	scenes: {
		level: {
			createGrid: (settings: Record<string, unknown>) => Grid;
			layers: string[];
		};
	};
	settings: string;
};
