import type Audio from "../game/Audio";

export type TResultValue = string | number | boolean | TResultValue[];

// export type TVarSprites = {
// 	get: (idx: number) => Entity;
// 	add: (sprite: Entity) => void;
// };

export type TVarSound = {
	name: string;
	audio: Audio;
	play: () => void;
};
export type TVarSounds = Map<string, TVarSound>;

export type TTimers = Record<string, { time: number; repeat: number }>;
