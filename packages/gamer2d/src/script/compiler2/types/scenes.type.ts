import type { TNeatLayer } from "./layers.type";

export type TNeatScene = { [key: string]: unknown; name: string; layers: TNeatLayer[] };

// export type TNeatScene = {
// 	type: "display" | "game" | "level";
// 	name: string;
// 	layers: TLayerSheet[];
// 	showCursor?: boolean;
// 	debug?: boolean;
// };
