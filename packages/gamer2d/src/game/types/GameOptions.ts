import type { Entity } from "../../entities/Entity";
import type { Layer } from "../../layers/Layer.class";
import type { View } from "../../layers/display/views/View";
import type { Scene } from "../../scenes/Scene";
import type { Trait } from "../../traits/Trait";
import type { Constructor } from "../../types/typescript.types";

export type EntityConstructor = Constructor<Entity>;
export type TraitConstructor = Constructor<Trait>;
export type SceneConstructor = Constructor<Scene>;
export type LayerConstructor = Constructor<Layer>;
export type ViewConstructor = Constructor<View>;

export type TEntityDefinition = { name: string; classType: EntityConstructor };
export type TLayerDefinition = { name: string; classType: LayerConstructor };
export type TViewDefinition = { name: string; classType: ViewConstructor };
export type TTraitDefinition = { name: string; classType: TraitConstructor; alias?: string };

export type GameOptions = {
	paths: {
		spritesheets: string;
		audiosheets: string;
		fonts: string;
		scenes: string;
		levels: string;
	};
	settings: string;
	isDebugEnabled?: boolean;

	entities?: TEntityDefinition[];
	traits?: TTraitDefinition[];
	layers?: TLayerDefinition[];
};
