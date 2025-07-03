import {
	AnimationTrait,
	DIRECTIONS,
	Entity,
	type GameContext,
	KeyboardPlayerOneTrait,
	KillableTrait,
	PhysicsTrait,
	PlayerTrait,
	type ResourceManager,
	type Scene,
	SolidTrait,
	XDragTrait,
} from "gamer2d";
import { JumpTrait } from "../traits/jump.trait.js";

export class BubblunEntity extends Entity {
	// private physicsTrait: PhysicsTrait;
	// private solidTrait: SolidTrait;
	private animTrait: AnimationTrait;
	private jumpTrait: JumpTrait;
	private xdragTrait: XDragTrait;

	constructor(resourceMgr: ResourceManager, x: number, y: number, dir = DIRECTIONS.LEFT) {
		super(resourceMgr, x, y, "bubblun");

		this.isFixed = false;
		this.dir = dir;
		this.mass = 60;

		this.addTrait(new PlayerTrait());
		this.addTrait(new KeyboardPlayerOneTrait());
		this.xdragTrait = new XDragTrait();
		this.addTrait(this.xdragTrait);
		this.jumpTrait = new JumpTrait();
		this.addTrait(this.jumpTrait);
		this.addTrait(new PhysicsTrait());
		this.addTrait(new SolidTrait());
		// this.addTrait(new KillableTrait(80000));
		this.addTrait(new KillableTrait());

		this.animTrait = new AnimationTrait();
		this.addTrait(this.animTrait);
	}

	stateToAnim() {
		if (this.vel.y && this.jumpTrait.isJumping) {
			this.animTrait.setAnim(this, this.vel.y < 0 ? "bubblun-up" : "bubblun-down");
			this.xdragTrait.dragFactor = 6000;
			return;
		}
		this.animTrait.setAnim(this, this.vel.x ? "bubblun-walk" : "bubblun-idle");
		this.xdragTrait.dragFactor = 400;
	}

	update(gc: GameContext, scene: Scene): void {
		this.stateToAnim();
		super.update(gc, scene);
	}

	render({ scene, viewport: { ctx } }) {
		if (this.currSprite)
			this.spritesheet?.draw(this.currSprite, ctx, this.bbox.left, this.bbox.top, {
				zoom: 1,
				flip: this.dir === DIRECTIONS.RIGHT ? 1 : 0,
			});

		// ctx.fillStyle = "white";
		// ctx.font = "6px sans-serif";
		// ctx.fillText(`${this.vel.x}`, this.left, this.bottom + 7);

		// ctx.strokeStyle = "white";
		// if (this.solidTrait.onLeft) {
		// 	ctx.strokeRect(this.left, this.top, 2, this.height);
		// }
		// if (this.solidTrait.onRight) {
		// 	ctx.strokeRect(this.right, this.top, 2, this.height);
		// }
		// if (this.solidTrait.onTop) {
		// 	ctx.strokeRect(this.left, this.top, this.width, 2);
		// }
		// if (this.solidTrait.onBottom) {
		// 	ctx.strokeRect(this.left, this.bottom, this.width, 2);
		// }
		// this.solidTrait.onLeft = false;
		// this.solidTrait.onRight = false;
		// this.solidTrait.onTop = false;
		// this.solidTrait.onBottom = false;

		// if (scene?.settings?.show_entity_frame) {
		// 	ctx.strokeStyle = this.solidTrait.isColliding ? "red" : "blue";
		// 	ctx.strokeRect(this.left, this.top, this.width, this.height);
		// }
	}
}
