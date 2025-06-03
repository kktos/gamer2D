import { DisplayPage } from "./display.page";
import { EntitiesPage } from "./entities.page";
import { EntityPropsPage } from "./entity-props.page";
import { LayoutItemPropsPage } from "./layout-item-props.page";
import { LayoutPage } from "./layout.page";
import { PropertiesPage } from "./properties.page";
import { ScenePage } from "./scene.page";
import { VariablesPage } from "./variables.page";

export const PAGES = {
	DEFAULT: { title: "Properties", class: PropertiesPage },
	entities: { title: "Entities", class: EntitiesPage },
	"entity-properties": { title: "Properties", class: EntityPropsPage },
	scene: { title: "Scene", class: ScenePage },
	// game: { title: "Game", class: DebugPage },
	variables: { title: "Variables", class: VariablesPage },
	display: { title: "Display Layer", class: DisplayPage },
	layout: { title: "Display Layout", class: LayoutPage },
	"layout-item-props": { title: "Layout Item", class: LayoutItemPropsPage },
};
export type PageKey = keyof typeof PAGES;
