import { Entity } from "gamer2d/entities/Entity";
import { AnimationTrait } from "gamer2d/traits/animation.trait";
import { KillableTrait } from "gamer2d/traits/killable.trait";
import { PhysicsTrait } from "gamer2d/traits/physics.trait";
import { SolidTrait } from "gamer2d/traits/solid.trait";
import { DIRECTIONS } from "gamer2d/types/direction.type";
import { AITrait } from "../traits/ai.trait.js";

// import EnemyTrait from "../traits/enemy.trait";

const _NORMAL_SPEED = 250;

type ZenChanDTO = {
	at: {
		x: number;
		y: number;
	};
	dir: number;
};

export class ZenChanEntity extends Entity {
	private physicsTrait: PhysicsTrait;
	private solidTrait: SolidTrait;

	constructor(zenChanDTO: ZenChanDTO) {
		super(zenChanDTO.at.x, zenChanDTO.at.y, "zen-chan");

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

		this.addTrait(new AITrait());

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
