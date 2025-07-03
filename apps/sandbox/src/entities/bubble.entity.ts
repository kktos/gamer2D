import { AnimationTrait, Entity, OffscreenTrait, type ResourceManager, VelocityTrait, getRandom } from "gamer2d";

export class BubbleEntity extends Entity {
	constructor(resourceMgr: ResourceManager, x: number, y: number) {
		super(resourceMgr, x, y, "misc");

		this.reset(x, y);

		const animTrait = new AnimationTrait();

		this.addTrait(new VelocityTrait());
		this.addTrait(new OffscreenTrait());
		this.addTrait(animTrait);

		animTrait.setAnim(this, "bubble");

		// if (this.currSprite) {
		// 	const s = this.spritesheet?.spriteSize(this.currSprite);
		// 	if (s) this.bbox.setSize(s);
		// }
	}

	reset(x: number, y: number) {
		if (this.currSprite) {
			const s = this.spritesheet?.spriteSize(this.currSprite);
			if (s) this.bbox.setSize(s);
		}
		this.bbox.setPosition(x, y);
		this.vel = { x: getRandom(10, 100), y: getRandom(10, 100) };
		// this.vel = { x: getRandom(1, 10), y: getRandom(1, 10) };
		this.vel.x = getRandom(0, 1) > 0.5 ? this.vel.x : -this.vel.x;
		this.vel.y = getRandom(0, 1) > 0.5 ? this.vel.y : -this.vel.y;
		this.isFixed = false;
		this.trait<AnimationTrait>("AnimationTrait")?.start();
	}

	render({ viewport: { ctx } }) {
		if (this.currSprite) this.spritesheet?.draw(this.currSprite, ctx, this.bbox.left, this.bbox.top);
		// this.spritesheet.drawAnim(this.currSprite, ctx, this.pos.x, this.pos.y, this.lifetime);
		// ctx.fillStyle = "white";
		// ctx.font = "6px sans-serif";
		// ctx.fillText(`(${Math.floor(this.vel.x)},${Math.floor(this.vel.y)})`, this.left - 5, this.bottom + 5);
	}
}
