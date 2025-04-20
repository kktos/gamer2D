export const OP_TYPES = {
	TEXT: 0,
	SPRITE: 1,
	IMAGE: 2,
	MENU: 3,
	GROUP: 4,
	REPEAT: 5,
	ANIM: 6,
	SET: 7,
	RECT: 8,
	VIEW: 9,
	SOUND: 10,
	MATH: 11,
} as const;

export const OP_TYPES_STR = Object.keys(OP_TYPES);
