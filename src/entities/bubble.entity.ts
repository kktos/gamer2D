import type ResourceManager from "../game/ResourceManager";
import { getRandom } from "../maths/math";
import AnimationTrait from "../traits/animation.trait";
import KillIfOffscreenTrait from "../traits/killOffscreen";
// import FollowPathTrait from "../traits/followPath.trait.js";
import KillableTrait from "../traits/killable.trait";
import VelocityTrait from "../traits/velocity.trait";
import { Entity } from "./Entity";

export default class BubbleEntity extends Entity {
	constructor(resourceMgr: ResourceManager, x: number, y: number) {
		super(resourceMgr, x, y, "misc");

		this.isFixed = false;
		this.vel = { x: getRandom(10, 100), y: getRandom(10, 100) };

		this.vel.x = getRandom(0, 1) > 0.5 ? this.vel.x : -this.vel.x;
		this.vel.y = getRandom(0, 1) > 0.5 ? this.vel.y : -this.vel.y;

		const animTrait = new AnimationTrait();

		this.addTrait(new VelocityTrait());
		this.addTrait(new KillableTrait());
		this.addTrait(new KillIfOffscreenTrait());
		this.addTrait(animTrait);
		// this.addTrait(new FollowPathTrait());

		animTrait.setAnim(this, "bubble");
	}

	render({ viewport: { ctx } }) {
		if (this.currSprite) this.spritesheet?.draw(this.currSprite, ctx, this.left, this.top);
		// this.spritesheet.drawAnim(this.currSprite, ctx, this.pos.x, this.pos.y, this.lifetime);
		// ctx.fillText(`${this.vel.x} ${this.vel.y}`,300,600-20);
	}
}
