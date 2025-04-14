// const rootDir= "./assets";
const rootDir = "";

const VIEWPORT_RATIO = 387 / 315;

const ENV = {
	MAIN_FONT: "bubble-bobble",

	// SCENES_PATH: "scenes/",
	// LEVELS_DIR: "/levels/",
	// SOUNDS_PATH: "sounds/",
	VOLUME: 50,

	// SPRITESHEETS_PATH: "spritesheets/",
	// IMAGES_PATH: "images/",
	// FONTS_PATH: "fonts/",

	COLORS: {
		DEFAULT_TEXT: "white",
		SELECTED_TEXT: "#ffff07",
		// SELECT_RECT: "#A5A5A5",
		SELECT_RECT: "",
	},

	LEVEL_GRID: {
		X: 20,
		Y: 55,
		COL: 35,
		ROW: 26,
		CELL_WIDTH: 16,
		CELL_HEIGHT: 16,
	},

	HIGHSCORES_COUNT: 10,

	MAX_LIFES: 3,

	// VIEWPORT_WIDTH: 600,
	// VIEWPORT_HEIGHT: 600,
	// VIEWPORT_WIDTH: 387*2,
	// VIEWPORT_HEIGHT: 315*2,

	VIEWPORT_RATIO: 387 / 315,
	VIEWPORT_WIDTH: 600,
	VIEWPORT_HEIGHT: 600,

	UI_HEIGHT: 200,

	FPS: 60,
};

export default ENV;
