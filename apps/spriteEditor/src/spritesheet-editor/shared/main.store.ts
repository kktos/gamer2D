import type { Anim } from "gamer2d/game/Anim";
import { Signal } from "./signal.class.js";

export const selectedAnim = new Signal<{ name: string; anim: Anim } | undefined>(undefined);
