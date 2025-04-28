// import WallEntity from "../entities/wall.entity.js";
import type Font from "../game/Font";
import type { SpriteSheet } from "../game/Spritesheet";
import { ALIGN_TYPES } from "../script/compiler/display/layout/text-sprite-props.rules";
// import Level from "../scene/level.scene.js";
// import PlayerTrait from "../traits/player.trait.js";
import { Layer } from "./Layer";

let flipflop = true;
export class DashboardLayer extends Layer {
	private width: number;
	private centerX: number;
	private spritesheet: SpriteSheet;
	private lifeY: number;
	private lifeW: number;
	private font: Font;

	constructor(gc, parent) {
		super(gc, parent);

		const rezMgr = gc.resourceManager;

		this.width = gc.viewport.width;
		this.centerX = Math.floor(this.width / 2);
		this.spritesheet = rezMgr.get("sprite", "bubblun");

		const lifeSize = this.spritesheet.spriteSize("life");
		this.lifeY = gc.viewport.height - lifeSize.y * 2 - 6;
		this.lifeW = lifeSize.x;

		// this.walls= [];
		// this.walls.push(
		// 	new WallEntity(rezMgr, "wallTop", 0, ENV.WALL_TOP),
		// 	new WallEntity(rezMgr, "wallLeft", 2, ENV.WALL_TOP),
		// 	new WallEntity(rezMgr, "wallRight", 0, ENV.WALL_TOP)
		// );
		// this.walls[2].left= this.width - this.walls[2].size.x - 2;

		this.font = rezMgr.get("font", gc.resourceManager.mainFontName);

		// this.timer= 0;
	}

	render({ tick, viewport: { ctx } }) {
		// const playerTrait= paddle?.traits.get(PlayerTrait);
		// const playerInfo= { highscore:playerTrait?.highscore??0, score:playerTrait?.score??0, lives:playerTrait?.lives??3 };
		const playerInfo = { highscore: 0, score: 0, lives: 3 };

		this.font.size = 3;
		this.font.align = ALIGN_TYPES.CENTER;
		this.font.print({ ctx, text: "HIGH SCORE", x: this.centerX, y: 1, color: "red" });
		this.font.print({ ctx, text: String(playerInfo.highscore), x: this.centerX, y: 28 });

		this.font.align = ALIGN_TYPES.LEFT;
		if (!(tick % 28)) flipflop = !flipflop;
		if (flipflop) this.font.print({ ctx, text: "1UP", x: this.width / 8, y: 1, color: "red" });
		this.font.print({ ctx, text: String(playerInfo.score), x: this.width / 8, y: 28 });

		for (let idx = 0; idx < playerInfo.lives; idx++)
			this.spritesheet.draw("life", ctx, 22 + idx * this.lifeW, this.lifeY, {
				flip: 0,
				zoom: 1,
			});

		// switch(state) {
		// 	case Level.STATE_STARTING: {
		// 		if(!this.timer)
		// 			this.timer= tick;
		// 		this.font.align= Align.Center;
		// 		this.font.print(ctx, name, this.width/2, 480);
		// 		if(tick - this.timer > 50)
		// 			this.font.print(ctx, "READY", this.width/2, 520);
		// 		break;
		// 	}
		// 	case Level.STATE_ENDING: {
		// 		this.font.align= Align.Center;
		// 		this.font.print(ctx, "GAME OVER", this.width/2, 400);
		// 	}
		// }
	}
}
