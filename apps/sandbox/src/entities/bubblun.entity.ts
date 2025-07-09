import { Entity } from "gamer2d/entities/Entity";
import type { GameContext } from "gamer2d/game/index";
import type { Scene } from "gamer2d/scenes/Scene";
import { AnimationTrait } from "gamer2d/traits/animation.trait";
import { KillableTrait } from "gamer2d/traits/killable.trait";
import { PhysicsTrait } from "gamer2d/traits/physics.trait";
import { PlayerTrait } from "gamer2d/traits/player.trait";
import { SolidTrait } from "gamer2d/traits/solid.trait";
import { type ITrait, Trait } from "gamer2d/traits/Trait";
import { XDragTrait } from "gamer2d/traits/xdrag.trait";
import { DIRECTIONS } from "gamer2d/types/direction.type";
import { JumpTrait } from "../traits/jump.trait.js";
import { KeyboardPlayerTrait } from "../traits/keyboard_player.trait.js";

type BubblunDTO = {
	at: {
		x: number;
		y: number;
	};
	dir: number;
};

export class BubblunEntity extends Entity {
	private animTrait: AnimationTrait;
	private jumpTrait: JumpTrait;
	private xdragTrait: XDragTrait;

	private isDead = false;
	private isBuried = false;

	constructor(bubblunDTO: BubblunDTO) {
		super(bubblunDTO.at.x, bubblunDTO.at.y, "bubblun");

		this.isFixed = false;
		this.dir = bubblunDTO.dir;
		this.mass = 60;

		this.xdragTrait = new XDragTrait();
		this.jumpTrait = new JumpTrait();
		this.animTrait = new AnimationTrait();

		// let the enemy handles the collision
		const collisionTrait: ITrait = new Trait();
		collisionTrait.collides = (gc: GameContext, entity: Entity, target: Entity) => {
			target.collides(gc, entity);
		};

		const deathTrait: ITrait = new Trait();
		deathTrait.on(KillableTrait.EVENT_KILLED, (_entity) => {
			this.isDead = true;
		});

		this.addTraits([
			new PlayerTrait(),
			new KeyboardPlayerTrait(),
			collisionTrait as Trait,
			deathTrait as Trait,
			this.xdragTrait,
			this.jumpTrait,
			new PhysicsTrait(),
			new SolidTrait(),
			new KillableTrait(0.1),
			this.animTrait,
		]);
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
		if (this.isDead && !this.isBuried) {
			this.isBuried = true;
			scene.emit(Symbol.for("PLAYER_DEAD"), this);
		}
	}

	render({ viewport: { ctx } }) {
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
