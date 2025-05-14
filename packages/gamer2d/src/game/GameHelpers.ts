import { setupEntity } from "../entities/Entity.factory";
import { setupLayer } from "../layers/Layer.factory";
import { setupView } from "../layers/display/views/View.factory";
import { setupScene } from "../scene/Scene.factory";
import type { TSceneSheet } from "../script/compiler/scenes/scene.rules";
import { setupTrait } from "../traits/Trait.factory";
import type { EntityConstructor, LayerConstructor, SceneConstructor, TraitConstructor, ViewConstructor } from "./types/GameOptions";

export function addEntity(entityName: string, entityClass: EntityConstructor) {
	setupEntity({ name: entityName, classType: entityClass });
}

export function addTrait(traitClass: TraitConstructor) {
	setupTrait(traitClass);
}

export function addScene(sceneType: TSceneSheet["type"], sceneClass: SceneConstructor) {
	setupScene(sceneType, sceneClass);
}

export function addLayer(layerName: string, layerClass: LayerConstructor) {
	setupLayer({ name: layerName, classType: layerClass });
}

export function addView(viewName: string, viewClass: ViewConstructor) {
	setupView({ name: viewName, classType: viewClass });
}
