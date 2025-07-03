import type { TNeatCommand } from "./commands.type";

export type TNeatLayer = { type: string; path?: string; name?: string; data?: TNeatCommand[] };
