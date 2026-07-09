/** biome-ignore-all lint/suspicious/noFallthroughSwitchClause: <explanation> */
import type { Entity } from "gamer2d/entities/Entity";
import type { GameContext } from "gamer2d/game/index";
import type { EntitiesLayer } from "gamer2d/layers/entities.layer";
import type { WorldCollisionLayer } from "gamer2d/layers/worldcollision.layer";
import { type KillableTrait, Trait } from "gamer2d/traits/index";
import { DIRECTIONS } from "gamer2d/types/direction.type"; // Ensure DIRECTIONS is imported
import { BBox } from "gamer2d/utils/maths/BBox.class";
import type { Grid } from "gamer2d/utils/maths/grid.math";
import { COLLISION_SIDES, type TCollisionSide } from "gamer2d/utils/maths/math"; // Ensure COLLISION_SIDES and TCollisionSide are imported
import type { JumpTrait } from "./jump.trait.js";

const UP = -1;
const DOWN = 1;
const LEFT = -1;
const RIGHT = 1;
const NONE = 0;

const JUMP_FORWARD_DURATION = 0.2;
const JUMP_FORWARD_SPEED = 80;
const JUMP_UP_DURATION = 0.3;
const JUMP_UP_SPEED = 205;

// Enum for Zen Chan's states, conceptually mapping to the Z80 (ix+6) values
enum ZenChanState {
	Fall = 0,
	Walk = 1,
	JumpUpForward = 2,
	JumpForward = 3,
	JumpDownForward = 4,
	JumpUp = 5, // Corresponds to BustWalkJumpUp in the assembly
}

type ZenChanNormalBehaviourDTO = {
	speed: number;
	dir: number;
	mass: number;
};

export class AI3Trait extends Trait {
	private players: Entity[];
	private grid: Grid | undefined;

	public state: ZenChanState;
	private jumpCounter: number; // Mimics (ix+4) for jump sequence progression
	private direction: number;
	public vertical_direction: typeof UP | typeof DOWN | typeof NONE = NONE;

	// Constants for movement speeds and gravitational effects (may need fine-tuning)
	// These values are in pixels per frame, assuming 60 FPS.
	private readonly WALK_SPEED = 1.8; // Zen Chan's horizontal walking speed
	private readonly JUMP_UP_SPEED = -4.0; // Initial upward velocity for jumps (negative for up)
	private readonly JUMP_FORWARD_SPEED = 2.8; // Horizontal speed during parabolic jumps

	speed: number;
	mass: number;
	cellCheckedPos: { x: number; y: number; width: number; height: number; color: string } = { x: 0, y: 0, width: 0, height: 0, color: "red" };

	constructor(dto: ZenChanNormalBehaviourDTO) {
		super();

		this.speed = dto.speed;
		this.mass = dto.mass;

		this.players = [];
		this.state = ZenChanState.Fall; // AI starts in Fall state
		this.jumpCounter = 0;
		// Initialize AI's `direction` based on the base trait's initial `dir`
		this.direction = dto.dir === DIRECTIONS.RIGHT ? RIGHT : LEFT;
	}

	obstructedOn(_gc: GameContext, entity: Entity, side: TCollisionSide, _bbox: BBox) {
		switch (side) {
			case COLLISION_SIDES.BOTTOM:
				// console.log("BOTTOM", _bbox);

				entity.vel.y = 0;
				entity.bbox.bottom = _bbox.top;

				// if (this.state === ZenChanState.JumpUp) {
				// 	this.vertical_direction = NONE;
				// }

				this.state = ZenChanState.Walk;

				entity.vel.x = 0;
				// this.bustLookAround(entity, this.players[0]); // Look around immediately upon landing
				// }
				break;
			case COLLISION_SIDES.LEFT:
				console.log("LEFT", _bbox);
				this.direction = 1;
				if (this.state !== ZenChanState.Walk && this.state !== ZenChanState.Fall) this.state = ZenChanState.Fall;
				// entity.vel.x = -entity.vel.x;
				// entity.bbox.left = _bbox.right + 1;
				break;
			case COLLISION_SIDES.RIGHT:
				console.log("RIGHT", _bbox);
				this.direction = -1;
				if (this.state !== ZenChanState.Walk && this.state !== ZenChanState.Fall) this.state = ZenChanState.Fall;
				break;
		}
	}

	collides(_gc: GameContext, _entityy: Entity, target: Entity) {
		if (target.trait("PlayerTrait")) target.useTrait("KillableTrait", (it: KillableTrait) => it.kill());
	}

	update(gc: GameContext, entity: Entity) {
		entity.dir = this.direction === RIGHT ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;

		// Lazy-load grid and players from the scene layers
		const scene = gc.scene;
		if (!scene) {
			console.warn("Scene not available for AITrait update. AI logic may not function.");
			return;
		}

		if (!this.grid) {
			scene.useLayer("worldcollision", (layer: WorldCollisionLayer) => {
				if (layer.grid) this.grid = layer.grid;
			});
		}
		scene.useLayer("entities", (layer: EntitiesLayer) => {
			this.players = layer.findByTrait("PlayerTrait");
		});

		// If no grid or players are found, skip AI logic for this frame
		// if (!this.players.length || !this.grid) return;
		if (!this.grid) return;

		const player = this.players[0]; // Assume focusing on the first player found

		// Apply gravity if Zen Chan is currently considered "falling" by the base trait
		// and is not actively performing an upward jump (which has its own controlled velocity).
		// The base trait sets `isFalling` to true if no bottom collision is detected for a period.
		// if (this.isFalling && this.state !== ZenChanState.JumpUp) {
		// entity.vel.y += this.GRAVITY;
		// }

		// State machine logic: dispatch to appropriate handler based on current state
		switch (this.state) {
			case ZenChanState.Fall:
				// The transition from Fall to Walk is now primarily handled in `obstructedOn(COLLISION_SIDES.BOTTOM)`.
				// No additional logic needed here unless there are specific "mid-air fall" behaviors.
				break;
			case ZenChanState.Walk:
				this.handleWalk(entity, player);
				entity.bbox.left += entity.vel.x;
				break;
			// case ZenChanState.JumpUpForward:
			// 	this.handleJumpUpForward(entity);
			// 	entity.bbox.left += entity.vel.x;
			// 	entity.bbox.top += entity.vel.y;
			// 	break;
			case ZenChanState.JumpForward:
				// 	this.handleJumpForward(entity);
				entity.bbox.left += entity.vel.x;
			// 	entity.bbox.top += entity.vel.y;
			// 	break;
			// case ZenChanState.JumpDownForward:
			// 	this.handleJumpDownForward(entity);
			// 	entity.bbox.left += entity.vel.x;
			// 	entity.bbox.top += entity.vel.y;
			// 	break;
			// case ZenChanState.JumpUp:
			// 	this.handleJumpUp(entity);
			// entity.bbox.left += entity.vel.x;
			// 	entity.bbox.top += entity.vel.y;
			// 	break;
		}

		// Apply the calculated velocities to the entity's position using its BBox setters
		// entity.bbox.left += entity.vel.x;
		// entity.bbox.top += entity.vel.y;

		// Reset vertical velocity if on ground and not actively jumping up.
		// This is a safety check and helps prevent velocity accumulation on surfaces.
		// if (this.isOnGround(entity) && this.state !== ZenChanState.JumpUp) {
		// entity.vel.y = 0;
		// }

		// Original line-of-sight check (can be integrated into AI decision making if needed)
		// const playerY = this.grid.toGridY(player.bbox.top);
		// const monsterY = this.grid.toGridY(entity.bbox.top);
		// if (playerY === monsterY) {
		// 	if (!this.hasLineOfSight(this.grid, entity.bbox, player.bbox)) {
		// 		// console.log("INVISIBLE"); // Log for debugging, remove in final game
		// 	}
		// }
	}

	// private handleFall(entity: Entity) {
	// 	entity.vel.x = 0; // No horizontal movement while falling in a pure fall state
	// }

	/**
	 * Handles Zen Chan's walking behavior, including movement, hole detection,
	 * and deciding when to look around or jump. This mimics `DumbWalk` from the Z80.
	 * @param entity The Zen Chan entity.
	 * @param player The player entity.
	 */
	private handleWalk(entity: Entity, player: Entity) {
		// Horizontal movement based on AI's `direction`
		entity.vel.x = this.direction * this.WALK_SPEED;
		// entity.vel.y = 0;

		if (entity.lifetime % 30 !== 0 && Math.floor(Math.random() * 32) === 0) this.bustLookAround(entity, player);

		if (!this.grid) return;

		this.cellCheckedPos.width = 0;
		this.cellCheckedPos.height = 0;

		switch (this.vertical_direction) {
			case NONE: {
				// Check for holes directly ahead (where Zen Chan is about to step)
				// Check a point just in front of and below the entity to detect holes
				const checkX = entity.bbox.left + (this.direction === 1 ? entity.bbox.width + 1 : -1); // 1 pixel outside leading edge
				const checkY = entity.bbox.bottom + 1; // 1 pixel below feet

				this.cellCheckedPos = {
					x: this.grid.toCoordX(this.grid.toGridX(checkX)),
					y: this.grid.toCoordY(this.grid.toGridY(checkY)),
					width: this.grid.cellWidth,
					height: this.grid.cellHeight,
					color: "yellow",
				};
				const tileAtNextPos = this.grid.get(this.grid.toGridX(checkX), this.grid.toGridY(checkY));

				// If there's no tile (air/hole) at the position Zen Chan is about to step onto
				if (!tileAtNextPos) {
					entity.useTrait("JumpTrait", (trait: JumpTrait) => {
						trait.start(JUMP_FORWARD_DURATION, JUMP_FORWARD_SPEED);
						this.state = ZenChanState.JumpForward;
					});

					// this.state = ZenChanState.JumpUpForward; // Transition to jump over the hole
					// this.jumpCounter = 0;
					// entity.vel.y = this.JUMP_UP_SPEED; // Initial upward velocity for jump
				}
				break;
			}
			case DOWN: {
				const checkX = entity.bbox.left + 1;
				const checkY = entity.bbox.bottom + 1; // 1 pixel below feet

				this.cellCheckedPos = {
					x: this.grid.toCoordX(this.grid.toGridX(checkX) + 1),
					y: this.grid.toCoordY(this.grid.toGridY(checkY)),
					width: Math.ceil(entity.bbox.width / this.grid.cellWidth) * this.grid.cellWidth,
					height: this.grid.cellHeight,
					color: "orange",
				};
				const floorLeft = this.grid.get(this.grid.toGridX(checkX), this.grid.toGridY(checkY));
				const floorRight = this.grid.get(this.grid.toGridX(checkX) + 2, this.grid.toGridY(checkY));

				if (!floorLeft && !floorRight) {
					this.state = ZenChanState.Fall;
					entity.vel.x = 0;
				}
				break;
			}
			case UP: {
				const gridTopX = this.grid.toCoordX(this.grid.toGridX(entity.bbox.left));
				const gridTopY = entity.bbox.top - 4 * this.grid.cellHeight;
				const gridBottomX = this.grid.toCoordX(this.grid.toGridX(entity.bbox.right));
				const gridBottomY = entity.bbox.top;

				this.cellCheckedPos = {
					x: gridTopX,
					y: gridTopY,
					width: gridBottomX - gridTopX,
					height: gridBottomY - gridTopY,
					color: "#0000FF80",
				};

				const range = this.grid.searchByRange(gridTopX, gridBottomX, gridTopY, gridBottomY);
				const canJump = range.some((cell) => cell);

				if (canJump) {
					this.cellCheckedPos.color = "#00FF0080";

					entity.useTrait("JumpTrait", (trait: JumpTrait) => {
						trait.start(JUMP_UP_DURATION, JUMP_UP_SPEED);
						this.state = ZenChanState.JumpUp;
					});
				}

				break;
			}
		}

		// Simplified jump initiation based on player position (similar to `StandardJumpCode`)
		// If player is significantly above Zen Chan, attempt a straight jump up.
		// If player is roughly one tile above (e.g., 16 pixels)
		// if (player.bbox.top < entity.bbox.top - 16) {
		// 	this.state = ZenChanState.JumpUp;
		// 	this.jumpCounter = 0;
		// 	entity.vel.y = this.JUMP_UP_SPEED; // Set initial upward velocity
		// 	entity.vel.x = 0; // Stop horizontal movement for straight jump
		// }
	}

	/**
	 * Handles the initial phase of a forward jump (moving up and forward).
	 * @param entity The Zen Chan entity.
	 */
	private handleJumpUpForward(entity: Entity) {
		entity.vel.x = this.direction * this.JUMP_FORWARD_SPEED;
		entity.vel.y = this.JUMP_UP_SPEED; // Maintain upward velocity initially

		this.jumpCounter++;
		// if (this.jumpCounter >= 6) {
		if (this.jumpCounter >= 12) {
			this.state = ZenChanState.JumpForward;
			this.jumpCounter = 0;
		}
	}

	/**
	 * Handles the mid-phase of a forward jump (moving primarily forward with gravity).
	 * @param entity The Zen Chan entity.
	 */
	private handleJumpForward(entity: Entity) {
		entity.vel.x = this.direction * this.JUMP_FORWARD_SPEED;
		// entity.vel.y += this.GRAVITY; // Start applying gravity, making the jump parabolic

		this.jumpCounter++;
		// if (this.jumpCounter >= 8) {
		if (this.jumpCounter >= 16) {
			// Z80: transitions after 8 increments
			this.state = ZenChanState.JumpDownForward;
			this.jumpCounter = 0;
		}
	}

	/**
	 * Handles the final phase of a forward jump (moving down and forward).
	 * @param entity The Zen Chan entity.
	 */
	private handleJumpDownForward(entity: Entity) {
		entity.vel.x = this.direction * this.JUMP_FORWARD_SPEED;
		// entity.vel.y += this.GRAVITY; // Continue applying gravity

		this.jumpCounter++;
		// if (this.jumpCounter >= 6) {
		if (this.jumpCounter >= 12) {
			// Z80: transitions after 6 increments
			this.state = ZenChanState.Fall; // End jump sequence by transitioning back to fall state
			this.jumpCounter = 0;
			// entity.vel.y = 0; // Reset Y velocity to ensure a clean fall
		}
	}

	/**
	 * Handles Zen Chan's straight upward jump behavior.
	 * @param entity The Zen Chan entity.
	 */
	private handleJumpUp(entity: Entity) {
		entity.vel.x = 0; // No horizontal movement during a straight jump up
		entity.vel.y = this.JUMP_UP_SPEED; // Constant upward speed

		this.jumpCounter++;
		if (this.jumpCounter >= 18) {
			// Z80: continues for 18 increments
			// Check for collision with ceiling/solid object above.
			// If a collision occurs, it should transition to fall.
			if (this.grid && this.checkCollisionUp(entity)) {
				this.state = ZenChanState.Fall;
				this.jumpCounter = 0;
				entity.vel.y = 0; // Stop upward movement
			} else if (this.jumpCounter > 20) {
				// Add a safety break to prevent infinite jump if no ceiling
				// If it jumps for too long without hitting a ceiling, assume it's at max height and fall.
				this.state = ZenChanState.Fall;
				this.jumpCounter = 0;
				entity.vel.y = 0;
			}
		}
	}

	/**
	 * Determines the player's relative position and updates Zen Chan's facing direction.
	 * This mimics the Z80 `BustLookAround` routine.
	 * @param entity The Zen Chan entity.
	 * @param player The player entity.
	 */
	private bustLookAround(entity: Entity, player: Entity) {
		console.log("looking around...");

		if (!player) return;

		this.vertical_direction = NONE;
		const playerGridY = this.grid?.toGridY(player.bbox.top) as number;
		const entityGridY = this.grid?.toGridY(entity.bbox.top) as number;

		if (playerGridY < entityGridY) {
			// Player is above
			this.vertical_direction = UP;
		} else if (playerGridY > entityGridY) {
			// Player is below
			this.vertical_direction = DOWN;
		}

		if (this.vertical_direction !== NONE) return;

		// Determine horizontal direction based on player's X position
		if (player.bbox.left < entity.bbox.left) {
			this.direction = LEFT; // Face left
		} else if (player.bbox.left > entity.bbox.left) {
			this.direction = RIGHT; // Face right
		}
	}

	/**
	 * Helper to check if Zen Chan is currently on solid ground.
	 * This method is used for proactive checks in AI logic, complementary to `obstructedOn`.
	 * @param entity The Zen Chan entity.
	 * @returns True if on ground, false otherwise.
	 */
	private isOnGround(entity: Entity): boolean {
		if (!this.grid) return false;
		// Check a point just below the entity's feet for a solid tile
		const feetY = entity.bbox.bottom + 1; // 1 pixel below bottom of bbox
		const gridY = this.grid.toGridY(feetY);
		if (gridY === 0) return false;

		const centerX = entity.bbox.left + entity.bbox.width / 2; // Center of entity for X
		const gridX = this.grid.toGridX(centerX);

		return !!this.grid.get(gridX, gridY); // True if a tile exists at the checked position
	}

	/**
	 * Helper to check for collision directly above Zen Chan's head.
	 * Used during the `JumpUp` state to detect ceilings.
	 * @param entity The Zen Chan entity.
	 * @returns True if a collision above is detected, false otherwise.
	 */
	private checkCollisionUp(entity: Entity): boolean {
		if (!this.grid) return false;
		// Check a point just above the entity's head
		const headY = entity.bbox.top - 1; // 1 pixel above top of bbox
		const centerX = entity.bbox.left + entity.bbox.width / 2; // Center of entity for X

		const gridX = this.grid.toGridX(centerX);
		const gridY = this.grid.toGridY(headY);

		return !!this.grid.get(gridX, gridY); // True if a tile exists
	}

	/**
	 * Original `hasLineOfSight` method, kept as provided.
	 * @param grid The game grid.
	 * @param enemyBBox The bounding box of the enemy.
	 * @param playerBBox The bounding box of the player.
	 * @returns True if there is a clear line of sight, false if blocked by a tile.
	 */
	private hasLineOfSight(grid: Grid, enemyBBox: BBox, playerBBox: BBox): boolean {
		const unionBBox = BBox.copy(enemyBBox);
		unionBBox.unionWith(playerBBox);

		// Convert to grid coordinates
		const startGridX = grid.toGridX(unionBBox.left);
		const endGridX = grid.toGridX(unionBBox.right);
		const topGridY = grid.toGridY(unionBBox.top);
		const bottomGridY = grid.toGridY(unionBBox.bottom);

		for (let x = startGridX; x <= endGridX; x++) {
			for (let y = topGridY; y <= bottomGridY; y++) {
				const cell = grid.get(x, y);
				if (cell) return false; // Line of sight blocked if a cell exists
			}
		}
		return true; // No blocking cells found
	}
}
