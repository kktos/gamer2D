import type { TupleToUnion } from "../../../types";

export const ALIGN_TYPES = {
	LEFT: 1,
	RIGHT: 2,
	TOP: 3,
	BOTTOM: 4,
	CENTER: 5,
} as const;

export type TAlignType = TupleToUnion<[(typeof ALIGN_TYPES)[keyof typeof ALIGN_TYPES]]>;
