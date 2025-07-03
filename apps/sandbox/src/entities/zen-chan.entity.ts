import { Entity } from "gamer2d";
import type { ResourceManager } from "gamer2d/game/ResourceManager";
import { AnimationTrait } from "gamer2d/traits/animation.trait";
import { KillableTrait } from "gamer2d/traits/killable.trait";
import { PhysicsTrait } from "gamer2d/traits/physics.trait";
import { SolidTrait } from "gamer2d/traits/solid.trait";
import { DIRECTIONS } from "gamer2d/types/direction.type";

// import EnemyTrait from "../traits/enemy.trait";

const NORMAL_SPEED = 250;

export class ZenChanEntity extends Entity {
	private physicsTrait: PhysicsTrait;
	private solidTrait: SolidTrait;

	constructor(resourceMgr: ResourceManager, x: number, y: number, dir = DIRECTIONS.LEFT) {
		super(resourceMgr, x, y, "zen-chan");

		this.isFixed = false;
		// this.mass = 3;

		const animTrait = new AnimationTrait();

		// this.addTrait(new ZenChanNormalBehaviourTrait(NORMAL_SPEED, dir, 70));
		this.physicsTrait = new PhysicsTrait();
		this.addTrait(this.physicsTrait);

		this.solidTrait = new SolidTrait();
		this.addTrait(this.solidTrait);

		this.addTrait(new KillableTrait());
		// this.addTrait(new EnemyTrait());
		this.addTrait(animTrait);

		animTrait.setAnim(this, "zen-chan");
	}

	render({ scene, viewport: { ctx } }) {
		if (this.currSprite)
			this.spritesheet?.draw(this.currSprite, ctx, this.bbox.left, this.bbox.top, {
				zoom: 1,
				flip: this.dir === DIRECTIONS.RIGHT ? 1 : 0,
			});
	}
}
