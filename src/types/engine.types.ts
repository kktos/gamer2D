import type { Entity } from "../entities/Entity";
import type Audio from "../game/Audio";
import type { System } from "../layers/display/views/System.view";
import type { View } from "../layers/display/views/View";

export type TExpr = string | number | boolean | TExpr[];

export type TVarSprites = {
	get: (idx: number) => Entity;
	add: (sprite: Entity) => void;
};

export type TVarSound = {
	name: string;
	audio: Audio;
	play: () => void;
};
export type TVarSounds = Map<string, TVarSound>;

export type TTimers = Record<string, { time: number; repeat: number }>;

export type TAnimation = {
	len: number;
	frames: string[] | { range: [number, number]; name: string };
	loop?: number;
};

export type TSpritesSheet = {
	img: string;
	sprites: Record<string, { scale: number; tiles?: unknown; groups?: unknown; rect?: unknown; rects?: unknown }>;
	animations: Record<string, TAnimation>;
};

export type TVarTypes = TExpr | TVarSounds | TVarSprites | Record<string, unknown> | null | View | System;
export type TVars = Map<string, TVarTypes>;
