import type { Anim } from "gamer2d/game/Anim";
import { Signal } from "../shared/signal.class.js";

export const selectedAnim = new Signal<{ name: string; anim: Anim } | undefined>(undefined);
