import type { TNeatLayer } from "./layers.type";

export type TNeatScene = { [key: string]: unknown; layers: TNeatLayer[] };
