import type { TNeatExpression } from "./expression.type";

export type TNeatPropertyAt = { x: TNeatExpression; y: TNeatExpression };
type TNeatPropertySize = { width: TNeatExpression; height: TNeatExpression };

export type TNeatCommand =
	| TNeatClearContextCommand
	| TNeatFontCommand
	| TNeatColorCommand
	| TNeatBgColorCommand
	| TNeatAlignCommand
	| TNeatTextCommand
	| TNeatSpriteCommand
	| TNeatZoomCommand
	| TNeatRectCommand
	| TNeatViewCommand
	| TNeatAssignCommand
	| TNeatSettingsCommand
	| TNeatVariablesCommand
	| TNeatItemCommand
	| TNeatButtonCommand
	| TNeatImageCommand
	| TNeatCallCommand
	| TNeatMenuCommand
	| TNeatPoolCommand
	| TNeatOnCommand
	| TNeatAnimationCommand
	| TNeatTimerCommand
	| TNeatSoundCommand
	| TNeatForCommand;

export type TNeatClearContextCommand = {
	cmd: "CLEARCONTEXT";
};

export type TNeatAssignCommand = {
	cmd: "ASSIGN";
	name: TNeatExpression;
	value: TNeatExpression;
	isConst?: boolean;
};

type TNeatSettingValue = boolean | string | number | Record<string, unknown> | (boolean | string | number)[];
export type TNeatSettingsCommand = {
	cmd: "SETTINGS";
	value: Record<string, TNeatSettingValue>;
};

export type TNeatVariablesCommand = {
	cmd: "VARIABLES";
	value: Record<string, TNeatSettingValue>;
};

export type TNeatCallCommand = {
	cmd: "CALL";
	value: TNeatExpression;
};

export type TNeatFontCommand = {
	cmd: "FONT";
	name?: string;
	size?: number;
};

export type TNeatAlignCommand = {
	cmd: "ALIGN";
	align: string;
	valign?: string;
};

export type TNeatZoomCommand = {
	cmd: "ZOOM";
	value: TNeatExpression;
};

export type TNeatColorCommand = {
	cmd: "COLOR";
	color: string;
};

export type TNeatBgColorCommand = {
	cmd: "BGCOLOR";
	color: string;
};

export type TNeatRectCommand = {
	cmd: "RECT";
	at: TNeatPropertyAt;
	size: TNeatPropertySize;
	id?: string;
	pad?: [TNeatExpression, TNeatExpression];
	fill?: string;
	color?: string;
	anims?: TNeatExpression;
	traits?: TNeatExpression;
};

export type TNeatTextCommand = {
	cmd: "TEXT";
	value: TNeatExpression;
	at: TNeatPropertyAt;
	font?: { name?: string; size?: number };
	size?: TNeatPropertySize;
	color?: TNeatExpression;
	id?: string;
	align?: TNeatAlignCommand;
	anims?: TNeatExpression;
	traits?: TNeatExpression;
	nocache?: boolean;
};

export type TNeatSpriteCommand = {
	cmd: "SPRITE";
	name: TNeatExpression;
	at: TNeatPropertyAt;
	size?: TNeatPropertySize;
	id?: string;
	dir?: string;
	anims?: TNeatExpression;
	traits?: TNeatExpression;
};

export type TNeatImageCommand = {
	cmd: "IMAGE";
	source: TNeatExpression;
	at: TNeatPropertyAt;
	repeat?: [TNeatExpression, TNeatExpression];
};

export type TNeatViewCommand = {
	cmd: "VIEW";
	type: string;
	at: TNeatPropertyAt;
	size: TNeatPropertySize;
	id?: string;
};

export type TNeatTimerCommand = {
	cmd: "TIMER";
	id: string;
	duration: TNeatExpression;
	timeScale: number;
	kind: "once" | "repeat" | "schedule";
};

export type TNeatSoundCommand = {
	cmd: "SOUND";
	name: string;
	isPaused: boolean;
};

export type TNeatItemCommand = {
	cmd: "ITEM";
	body: TNeatCommand[];
	action?: TNeatCommand[];
};

// FOR

export type TNeatVariableForCommand = {
	cmd: "FOR";
	var: string;
	list: TNeatExpression;
	index?: string;
	body: TNeatCommand[];
};
export type TNeatRangeForCommand = {
	cmd: "FOR";
	list: [TNeatExpression, TNeatExpression];
	index: string;
	body: TNeatCommand[];
};
export type TNeatForCommand = TNeatVariableForCommand | TNeatRangeForCommand;

// MENU

export type TNeatMenuSelection = {
	// color
	color?: string;
	// bgcolor
	background: string;
	// selection rect padding
	pad?: [TNeatExpression, TNeatExpression];
};

export type TNeatMenuKeys = {
	previous?: TNeatExpression;
	next?: TNeatExpression;
	select?: TNeatExpression;
};

export type TNeatMenuCommand = {
	cmd: "MENU";
	id: string;
	selection: TNeatMenuSelection;
	keys?: TNeatMenuKeys;
	items: TNeatCommand[];
};

// ON

export type TNeatOnCommand = {
	cmd: "ON";
	event: string;
	from?: string;
	params: string[];
	statements: TNeatCommand[];
};

// ANIMATION

export type TNeatAnimationCommand = {
	cmd: "ANIMATION";
	name: string;
	isPaused: boolean;
	repeat?: TNeatExpression;
	statements: TNeatCommand[];
};

// POOL

export type TNeatPoolCommand = {
	cmd: "POOL";
	spriteName: string;
	at?: { x: TNeatExpression; y: TNeatExpression };
	count: TNeatExpression;
	id: string;
	spawn?: TNeatExpression;
	traits?: TNeatExpression;
};

// BUTTON

// export type TNeatButtonCommand = {
// 	cmd: "BUTTON";
// 	id?: string;
// 	at?: TNeatPropertyAt;
// 	size?: TNeatPropertySize;
// 	body?: TNeatCommand[];
// 	trigger?: string;
// 	// border rect padding
// 	pad?: [TNeatExpression, TNeatExpression];
// };

// button <id> { statements }
export type TNeatButtonDefineCommand = {
	cmd: "BUTTON";
	id: string;
	body: TNeatCommand[];
};

// button at <x,y> trigger <string> { statements }
export type TNeatButtonInstantiationWithBodyCommand = {
	cmd: "BUTTON";
	trigger: string;
	at: TNeatPropertyAt;
	body: TNeatCommand[];
	id?: string;
	size?: TNeatPropertySize;
	pad?: [TNeatExpression, TNeatExpression];
};

// button <id> at <x,y> trigger <string> [content <expr>]
export type TNeatButtonInstantiationWithoutBodyCommand = {
	cmd: "BUTTON";
	trigger: string;
	at: TNeatPropertyAt;
	id: string; // required if body is absent
	body?: undefined; // ensures body is not present
	size?: TNeatPropertySize;
	pad?: [TNeatExpression, TNeatExpression];
	content?: TNeatExpression;
};

export type TNeatButtonCommand = TNeatButtonDefineCommand | TNeatButtonInstantiationWithBodyCommand | TNeatButtonInstantiationWithoutBodyCommand;
