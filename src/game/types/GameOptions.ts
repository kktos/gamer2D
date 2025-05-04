import type { Entity } from "../../entities/Entity";
import type { Layer } from "../../layers/Layer";
import type { Scene } from "../../scene/Scene";
import type { Trait } from "../../traits/Trait";
import type { Constructor } from "../../types/typescript.types";

export type EntityConstructor = Constructor<Entity>;
export type TraitConstructor = Constructor<Trait>;
export type SceneConstructor = Constructor<Scene>;
export type LayerConstructor = Constructor<Layer>;

export type TEntityDefinition = { name: string; classType: EntityConstructor };
export type TLayerDefinition = { name: string; classType: LayerConstructor };

export type GameOptions = {
	paths: {
		spritesheets: string;
		audiosheets: string;
		fonts: string;
		scenes: string;
		levels: string;
	};
	settings: string;

	entities?: TEntityDefinition[];
	traits?: TraitConstructor[];
	layers?: TLayerDefinition[];
};
