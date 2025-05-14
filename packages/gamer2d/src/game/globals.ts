import type { TVarDict, TVarTypes } from "../utils/vars.utils";

export const GLOBAL_VARIABLES: TVarDict = new Map<string, TVarTypes>([
	// display
	// ["highscores", 0],
	// ["player", 0],
	["mouseX", 0],
	["mouseY", 0],
	// ["sprites", 0],
	["clientHeight", 0],
	["clientWidth", 0],
	["centerX", 0],
	["centerY", 0],
	["centerUIY", 0],
	//menu
	["itemSelected", 0],
	["itemIdxSelected", 0],
	// debug
	["frameSpriteSize", 0],
	["frameSprite", 0],
	["spriteType", 0],
	["anim", 0],
	["spriteIndex", 0],
]);
