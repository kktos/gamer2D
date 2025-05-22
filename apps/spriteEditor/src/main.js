import Game from "../../../packages/gamer2d/dist/game/Game";
const canvas = document.getElementById("game");
if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    throw new Error("No Canvas game element found !?!");
}
const settings = `
	FPS = 60

	FONT.MAIN = bubble-bobble

	VIEWPORT.WIDTH = 600
	VIEWPORT.HEIGHT = 600
	VIEWPORT.RATIO = 1.23
	UI.HEIGHT = 200
	
	MENU.COLORS.SELECT_RECT = #A5A5A5
	MENU.COLORS.SELECTED_TEXT = #ffff07

	LEVEL_GRID.X = 20
	LEVEL_GRID.Y = 55

	PHYSICS.GRAVITY = 10

	AUDIO.VOLUME = 50

	LOGS = 
`;
const options = {
    paths: {
        audiosheets: "sounds",
        fonts: "fonts",
        spritesheets: "spritesheets",
        scenes: "scenes",
        levels: "levels",
    },
    settings,
};
const game = new Game(canvas, options);
