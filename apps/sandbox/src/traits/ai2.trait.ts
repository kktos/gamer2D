import type { Entity } from "gamer2d/entities/Entity";
import type { GameContext } from "gamer2d/game/index";
import type { EntitiesLayer } from "gamer2d/layers/entities.layer";
import type { WorldCollisionLayer } from "gamer2d/layers/worldcollision.layer";
import { DIRECTIONS } from "gamer2d/types/direction.type"; // Ensure DIRECTIONS is imported
import { BBox } from "gamer2d/utils/maths/BBox.class";
import type { Grid } from "gamer2d/utils/maths/grid.math";
import { COLLISION_SIDES, type TCollisionSide } from "gamer2d/utils/maths/math"; // Ensure COLLISION_SIDES and TCollisionSide are imported
import { ZenChanNormalBehaviourTrait } from "./ZenChanNormalBehaviour.trait.js";

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

export class AI2Trait extends ZenChanNormalBehaviourTrait {
	// AITrait now extends ZenChanNormalBehaviourTrait
	private players: Entity[];
	private grid: Grid | undefined;

	private state: ZenChanState;
	private jumpCounter: number; // Mimics (ix+4) for jump sequence progression
	private playerRelativeFlags: number; // Mimics (ix+7) for player relative position flags (e.g., player above/below)
	private currentFrame: number; // To mimic the global Z80 timer for periodic checks
	private direction: number; // -1 for left, 1 for right (horizontal facing/movement) - this will align with inherited newDir

	// Constants for movement speeds and gravitational effects (may need fine-tuning)
	// These values are in pixels per frame, assuming 60 FPS.
	private readonly WALK_SPEED = 0.5; // Zen Chan's horizontal walking speed
	private readonly JUMP_UP_SPEED = -2.0; // Initial upward velocity for jumps (negative for up)
	private readonly JUMP_FORWARD_SPEED = 0.7; // Horizontal speed during parabolic jumps
	private readonly GRAVITY = 0.2; // Vertical acceleration due to gravity

	constructor(dto: ZenChanNormalBehaviourDTO) {
		// Constructor must accept DTO for the base class
		super(dto); // Call the constructor of the base class
		this.players = [];
		this.state = ZenChanState.Fall; // AI starts in Fall state
		this.jumpCounter = 0;
		this.playerRelativeFlags = 0; // Initialize flags
		this.currentFrame = 0;
		// Initialize AI's `direction` based on the base trait's initial `dir`
		this.direction = dto.dir === DIRECTIONS.RIGHT ? 1 : -1;
	}

	/**
	 * Overrides the base trait's `obstructedOn` method to integrate AI state changes.
	 * This method is called by the game engine when the entity collides with terrain.
	 * @param gc Game context.
	 * @param entity The entity this trait is attached to.
	 * @param side The side of the entity that was obstructed.
	 * @param bbox The bounding box of the obstructing entity (if any).
	 */
	obstructedOn(gc: GameContext, entity: Entity, side: TCollisionSide, bbox: BBox) {
		super.obstructedOn(gc, entity, side, bbox); // Call the base trait's implementation first

		switch (side) {
			case COLLISION_SIDES.BOTTOM:
				// When the base trait registers a bottom collision, it sets `isFalling` to false.
				// This is the trigger for our AI to transition from the Fall state to Walk.
				if (this.state === ZenChanState.Fall) {
					this.state = ZenChanState.Walk;
					this.jumpCounter = 0; // Reset jump counter
					entity.vel.x = 0;
					entity.vel.y = 0;
					this.bustLookAround(entity, this.players[0]); // Look around immediately upon landing
				}
				break;
			case COLLISION_SIDES.LEFT:
			case COLLISION_SIDES.RIGHT:
				// Horizontal collision: the base trait handles changing `newDir` and `newSpeed`.
				// We update the AI's internal `direction` to match what the base trait has set.
				this.direction = this.newDir === DIRECTIONS.RIGHT ? 1 : -1;
				break;
			// COLLISION_SIDES.TOP is not explicitly handled by ZenChanNormalBehaviourTrait,
			// so we still rely on checkCollisionUp in AITrait for jump ceiling detection.
		}
	}

	/**
	 * Overrides the base trait's `collides` method.
	 * This method is called when Zen Chan collides with another entity.
	 * @param gc Game context.
	 * @param entity The entity this trait is attached to.
	 * @param target The entity Zen Chan collided with.
	 */
	collides(gc: GameContext, entity: Entity, target: Entity) {
		// Call the base trait's collides method to handle default behaviors, e.g., killing the player.
		super.collides(gc, entity, target);
		// Additional AI-specific collision reactions could be added here if needed.
	}

	/**
	 * The main update method for the AI trait, called every game frame.
	 * @param gc GameContext provides global game information (e.g., deltaTime).
	 * @param entity The Zen Chan entity this trait is attached to.
	 */
	update(gc: GameContext, entity: Entity) {
		super.update(gc, entity); // Call the base trait's update first (handles timeFalling, wannaChange, etc.)

		this.currentFrame++;

		// Lazy-load grid and players from the scene layers
		// Ensure scene is passed correctly if not available from context.
		// Assuming `scene` is implicitly available or passed to `update` (as it was previously).
		// Let's add a placeholder for scene if it's not present.
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
		if (!this.players.length || !this.grid) {
			return;
		}

		const player = this.players[0]; // Assume focusing on the first player found

		// Apply gravity if Zen Chan is currently considered "falling" by the base trait
		// and is not actively performing an upward jump (which has its own controlled velocity).
		// The base trait sets `isFalling` to true if no bottom collision is detected for a period.
		if (this.isFalling && this.state !== ZenChanState.JumpUp) {
			// entity.vel.y += this.GRAVITY;
		}

		// State machine logic: dispatch to appropriate handler based on current state
		switch (this.state) {
			case ZenChanState.Fall:
				// The transition from Fall to Walk is now primarily handled in `obstructedOn(COLLISION_SIDES.BOTTOM)`.
				// No additional logic needed here unless there are specific "mid-air fall" behaviors.
				break;
			case ZenChanState.Walk:
				this.handleWalk(entity, player);
				entity.bbox.left += entity.vel.x;
				// entity.bbox.top += entity.vel.y;

				break;
			case ZenChanState.JumpUpForward:
				this.handleJumpUpForward(entity);
				entity.bbox.left += entity.vel.x;
				entity.bbox.top += entity.vel.y;
				break;
			case ZenChanState.JumpForward:
				this.handleJumpForward(entity);
				entity.bbox.left += entity.vel.x;
				entity.bbox.top += entity.vel.y;
				break;
			case ZenChanState.JumpDownForward:
				this.handleJumpDownForward(entity);
				entity.bbox.left += entity.vel.x;
				entity.bbox.top += entity.vel.y;
				break;
			case ZenChanState.JumpUp:
				this.handleJumpUp(entity);
				entity.bbox.left += entity.vel.x;
				entity.bbox.top += entity.vel.y;
				break;
		}

		// Apply the calculated velocities to the entity's position using its BBox setters
		// entity.bbox.left += entity.vel.x;
		// entity.bbox.top += entity.vel.y;

		// Reset vertical velocity if on ground and not actively jumping up.
		// This is a safety check and helps prevent velocity accumulation on surfaces.
		if (this.isOnGround(entity) && this.state !== ZenChanState.JumpUp) {
			// entity.vel.y = 0;
		}

		// Original line-of-sight check (can be integrated into AI decision making if needed)
		// const playerY = this.grid.toGridY(player.bbox.top);
		// const monsterY = this.grid.toGridY(entity.bbox.top);
		// if (playerY === monsterY) {
		// 	if (!this.hasLineOfSight(this.grid, entity.bbox, player.bbox)) {
		// 		// console.log("INVISIBLE"); // Log for debugging, remove in final game
		// 	}
		// }
	}

	/**
	 * Handles Zen Chan's falling behavior.
	 * With `obstructedOn`, this method is less about detecting landing, and more about any ongoing fall effects.
	 * The transition to Walk is now in `obstructedOn`.
	 * @param entity The Zen Chan entity.
	 */
	private handleFall(entity: Entity) {
		entity.vel.x = 0; // No horizontal movement while falling in a pure fall state
		// The actual `isFalling` check and transition logic is handled by `obstructedOn`.
	}

	/**
	 * Handles Zen Chan's walking behavior, including movement, hole detection,
	 * and deciding when to look around or jump. This mimics `DumbWalk` from the Z80.
	 * @param entity The Zen Chan entity.
	 * @param player The player entity.
	 */
	private handleWalk(entity: Entity, player: Entity) {
		// Horizontal movement based on AI's `direction`
		entity.vel.x = this.direction * this.WALK_SPEED;
		entity.vel.y = 0;

		// Z80 `DumbWalk` logic for `BustLookAround`:
		// 1. Periodic check: `ld a,(timer) and 3; jr z,BustDontLookAround`
		//    This means if `timer % 4 === 0`, the random check is skipped.
		//    So, we only proceed to the random check if `currentFrame % 4 !== 0`.
		if (this.currentFrame % 4 !== 0) {
			// 2. Random chance: `call bubrand; and 15; call z,BustLookAround`
			//    This is a 1 in 16 chance (if random number's lowest 4 bits are zero).
			if (Math.floor(Math.random() * 16) === 0) {
				this.bustLookAround(entity, player);
			}
		}

		// Check for holes directly ahead (where Zen Chan is about to step)
		if (this.grid) {
			// Check a point just in front of and below the entity to detect holes
			const checkX = entity.bbox.left + (this.direction === 1 ? entity.bbox.width + 1 : -1); // 1 pixel outside leading edge
			const checkY = entity.bbox.bottom + 1; // 1 pixel below feet

			const tileAtNextPos = this.grid.get(this.grid.toGridX(checkX), this.grid.toGridY(checkY));

			// If there's no tile (air/hole) at the position Zen Chan is about to step onto
			if (!tileAtNextPos) {
				this.state = ZenChanState.JumpUpForward; // Transition to jump over the hole
				this.jumpCounter = 0;
				entity.vel.y = this.JUMP_UP_SPEED; // Initial upward velocity for jump
			}
		}

		// Simplified jump initiation based on player position (similar to `StandardJumpCode`)
		// If player is significantly above Zen Chan, attempt a straight jump up.
		if (player.bbox.top < entity.bbox.top - 16) {
			// If player is roughly one tile above (e.g., 16 pixels)
			this.state = ZenChanState.JumpUp;
			this.jumpCounter = 0;
			entity.vel.y = this.JUMP_UP_SPEED; // Set initial upward velocity
			entity.vel.x = 0; // Stop horizontal movement for straight jump
		}
	}

	/**
	 * Handles the initial phase of a forward jump (moving up and forward).
	 * @param entity The Zen Chan entity.
	 */
	private handleJumpUpForward(entity: Entity) {
		entity.vel.x = this.direction * this.JUMP_FORWARD_SPEED;
		entity.vel.y = this.JUMP_UP_SPEED; // Maintain upward velocity initially

		this.jumpCounter++;
		if (this.jumpCounter >= 6) {
			// Z80: transitions after 6 increments
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
		entity.vel.y += this.GRAVITY; // Start applying gravity, making the jump parabolic

		this.jumpCounter++;
		if (this.jumpCounter >= 8) {
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
		entity.vel.y += this.GRAVITY; // Continue applying gravity

		this.jumpCounter++;
		if (this.jumpCounter >= 6) {
			// Z80: transitions after 6 increments
			this.state = ZenChanState.Fall; // End jump sequence by transitioning back to fall state
			this.jumpCounter = 0;
			entity.vel.y = 0; // Reset Y velocity to ensure a clean fall
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
		// Clear old player relative flags (bits 0-5, assuming bits 6 and 7 are used for other purposes)
		this.playerRelativeFlags &= 0b11000000;

		// Determine horizontal direction based on player's X position
		if (player.bbox.left < entity.bbox.left) {
			// Using bbox.left for player position
			this.direction = -1; // Face left
		} else if (player.bbox.left > entity.bbox.left) {
			this.direction = 1; // Face right
		}

		// Determine vertical position relative to player and set flags
		// Z80 had specific offsets, approximated here for grid-based comparison.
		// Bit 3 for "player above", Bit 4 for "player below"
		const playerGridY = this.grid?.toGridY(player.bbox.top) as number;
		const entityGridY = this.grid?.toGridY(entity.bbox.top) as number;

		if (playerGridY < entityGridY) {
			// Player is above
			this.playerRelativeFlags |= 1 << 3;
		} else if (playerGridY > entityGridY) {
			// Player is below
			this.playerRelativeFlags |= 1 << 4;
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
