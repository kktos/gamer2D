import { Entity } from "gamer2d/entities/Entity";
import { AnimationTrait, KillableTrait, PhysicsTrait, SolidTrait } from "gamer2d/traits/";
import { DIRECTIONS } from "gamer2d/types/direction.type";
import { AI3Trait } from "../traits/ai3.trait.js";
import { JumpTrait } from "../traits/jump.trait.js";

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
	ai: AI3Trait;

	constructor(zenChanDTO: ZenChanDTO) {
		super(zenChanDTO.at.x, zenChanDTO.at.y, "zen-chan");

		this.isFixed = false;
		this.mass = 60;

		const animTrait = new AnimationTrait();

		// this.addTrait(new ZenChanNormalBehaviourTrait(NORMAL_SPEED, dir, 70));
		this.physicsTrait = new PhysicsTrait();
		this.addTrait(this.physicsTrait);

		this.addTrait(new SolidTrait());

		this.addTrait(new KillableTrait());

		this.addTrait(new JumpTrait(0.2, 80));

		// this.addTrait(new EnemyTrait());
		this.addTrait(animTrait);

		this.ai = new AI3Trait({
			speed: _NORMAL_SPEED,
			dir: zenChanDTO.dir,
			mass: this.mass,
		});
		this.addTrait(this.ai);

		animTrait.setAnim(this, "zen-chan");
	}

	render({ viewport: { ctx } }) {
		ctx.save();
		const r = this.ai.cellCheckedPos;
		ctx.fillStyle = r.color;
		ctx.fillRect(r.x, r.y, r.width, r.height);

		ctx.fillStyle = "red";
		ctx.fillRect(220, 520, 140, 40);
		ctx.fillStyle = "white";
		ctx.font = "20px Arial";
		let state = "";
		switch (this.ai.state) {
			case 0:
				state = "Fall";
				break;
			case 1:
				state = "Walk";
				break;
			default:
				state = "Jump";
				break;
		}
		let vDir = "";
		switch (this.ai.vertical_direction) {
			case -1:
				vDir = "UP";
				break;
			case 1:
				vDir = "DOWN";
				break;
			default:
				vDir = "NONE";
				break;
		}
		ctx.fillText(`${state} - ${vDir}`, 350, 545);

		ctx.restore();

		if (this.currSprite)
			this.spritesheet?.draw(this.currSprite, ctx, this.bbox.left, this.bbox.top, {
				zoom: 1,
				flip: this.dir === DIRECTIONS.RIGHT ? 1 : 0,
			});
	}
}
