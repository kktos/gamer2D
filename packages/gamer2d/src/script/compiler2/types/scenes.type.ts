import type { TNeatLayer } from "./layers.type";

export type TNeatScene = {
	// type: "display" | "game" | "level";
	type: string;
	name: string;
	layers: TNeatLayer[];
	[key: string]: unknown;
};

// export type TNeatScene = {
// 	type: "display" | "game" | "level";
// 	name: string;
// 	layers: TLayerSheet[];
// 	showCursor?: boolean;
// 	debug?: boolean;
// };
