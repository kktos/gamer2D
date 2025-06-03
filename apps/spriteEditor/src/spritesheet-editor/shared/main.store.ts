import type { Anim } from "gamer2d/game/Anim";
import type { RGBAColor } from "gamer2d/utils/canvas.utils";
import { Signal } from "./signal.class.js";

export const selectedSprite = Signal.create<string>();
export const selectedSprites = Signal.create<Set<string>>();

export const selectedAnim = new Signal<{ name: string; anim: Anim } | undefined>(undefined);

export const spritesheetSourceText = Signal.create<string>();
export const sourceImage = Signal.create<HTMLImageElement | HTMLCanvasElement>();

export const pickedColor = Signal.create<RGBAColor>();
