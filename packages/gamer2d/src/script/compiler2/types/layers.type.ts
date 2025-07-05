import type { TNeatCommand } from "./commands.type";

export type TNeatLayerLoad = {
	type: "settings" | "variables";
	path: string;
};

export type TNeatLayer = {
	type: string;
	path?: string;
	name?: string;
	data?: TNeatCommand[];
	load?: TNeatLayerLoad[];
};
