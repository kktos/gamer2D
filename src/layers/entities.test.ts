import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Entity } from "../entities/Entity";
import type GameContext from "../game/types/GameContext";
import type { Grid } from "../maths/grid.math";
import { intersectRect } from "../maths/math";
import type { Scene } from "../scene/Scene";
import type { TEntitiesLayerSheet } from "../script/compiler/layers/entities/entities.rules";
import { ArgColor } from "../types/value.types";
import { createLevelEntities } from "../utils/createLevelEntities.utils";
import { EntitiesLayer } from "./entities.layer";

// Mocks
vi.mock("../utils/createLevelEntities.utils");
vi.mock("../maths/math", async (importOriginal) => {
	const actual = await importOriginal<typeof import("../maths/math")>();
	return {
		...actual,
		intersectRect: vi.fn(),
	};
});

const mockCreateLevelEntities = vi.mocked(createLevelEntities);
const mockIntersectRect = vi.mocked(intersectRect);

class MockEntity implements Partial<Entity> {
	id: string;
	left = 0;
	top = 0;
	width = 10;
	height = 10;
	update = vi.fn();
	render = vi.fn();
	finalize = vi.fn();
	collides = vi.fn();

	constructor(id: string) {
		this.id = id;
	}
}

describe("EntitiesLayer", () => {
	let mockGc: GameContext;
	let mockScene: Scene;
	let mockGrid: Grid;
	let mockSheet: TEntitiesLayerSheet;
	let mockTaskHandlers: Map<symbol, (...args: unknown[]) => void>;

	beforeAll(() => {
		// Ensure static symbols are defined
		EntitiesLayer.TASK_ADD_ENTITY;
		EntitiesLayer.TASK_REMOVE_ENTITY;
	});

	beforeEach(() => {
		vi.clearAllMocks();
		mockTaskHandlers = new Map();

		mockGc = {
			resourceManager: { get: vi.fn() },
			viewport: {
				ctx: {
					fillStyle: "",
					font: "",
					textAlign: "",
					fillText: vi.fn(),
					strokeStyle: "",
					strokeRect: vi.fn(),
				},
				width: 320,
				height: 240,
			},
			dt: 0.016,
		} as unknown as GameContext;

		mockScene = {
			tasks: {
				onTask: vi.fn((name, handler) => {
					mockTaskHandlers.set(name, handler);
				}),
				emit: vi.fn(),
			},
		} as unknown as Scene;

		mockGrid = {} as Grid; // Simple mock, adjust if grid methods are needed

		mockSheet = {
			type: "entities",
			sprites: [
				{ name: "sprite1", pos: [10, 10] },
				{ name: "sprite2", pos: [20, 20] },
			],
			settings: {},
		};

		mockCreateLevelEntities.mockReturnValue([]); // Default mock return
	});

	it("should construct and initialize basic properties", () => {
		const layer = new EntitiesLayer(mockGc, mockScene, mockSheet);
		expect(layer).toBeInstanceOf(EntitiesLayer);
		expect(layer.gc).toBe(mockGc);
		expect(layer.scene).toBe(mockScene);
		expect(mockCreateLevelEntities).not.toHaveBeenCalled(); // No grid provided
		expect(mockScene.tasks.onTask).toHaveBeenCalledTimes(2);
		expect(mockScene.tasks.onTask).toHaveBeenCalledWith(EntitiesLayer.TASK_REMOVE_ENTITY, expect.any(Function));
		expect(mockScene.tasks.onTask).toHaveBeenCalledWith(EntitiesLayer.TASK_ADD_ENTITY, expect.any(Function));
	});

	it("should call spawnEntities if grid is provided during construction", () => {
		const mockEntities = [new MockEntity("e1"), new MockEntity("e2")] as unknown as Entity[];
		mockCreateLevelEntities.mockReturnValue(mockEntities);
		const layer = new EntitiesLayer(mockGc, mockScene, mockSheet, mockGrid);
		expect(mockCreateLevelEntities).toHaveBeenCalledWith(mockGc.resourceManager, mockGrid, mockSheet.sprites);
		expect(layer.get(0)).toBe(mockEntities[0]);
		expect(layer.get(1)).toBe(mockEntities[1]);
	});

	it("should process settings correctly", () => {
		mockSheet.settings = {
			show_entities_count: true,
			show_entity_frame: new ArgColor("blue"),
		};
		const layer = new EntitiesLayer(mockGc, mockScene, mockSheet);
		// Access private members for testing (consider if there's a better way)
		expect(layer.wannaShowCount).toBe(true);
		expect(layer.wannaShowFrame).toBe(true);
		expect(layer.frameColor).toBe("blue");
	});

	it("should clear entities", () => {
		mockCreateLevelEntities.mockReturnValue([new MockEntity("e1")] as unknown as Entity[]);
		const layer = new EntitiesLayer(mockGc, mockScene, mockSheet, mockGrid);
		expect(layer.get(0)).toBeDefined();
		layer.clear();
		expect(layer.get(0)).toBeUndefined();
	});

	it("should get entity by index or ID", () => {
		const entity1 = new MockEntity("id1");
		const entity2 = new MockEntity("id2");
		mockCreateLevelEntities.mockReturnValue([entity1, entity2] as unknown as Entity[]);
		const layer = new EntitiesLayer(mockGc, mockScene, mockSheet, mockGrid);

		expect(layer.get(0)).toBe(entity1);
		expect(layer.get(1)).toBe(entity2);
		expect(layer.get("id1")).toBe(entity1);
		expect(layer.get("id2")).toBe(entity2);
		expect(layer.get(2)).toBeUndefined();
		expect(layer.get("id3")).toBeUndefined();
	});

	it("should spawn entities using spawnEntities method", () => {
		const mockEntities = [new MockEntity("e1")];
		mockCreateLevelEntities.mockReturnValue(mockEntities as unknown as Entity[]);
		const layer = new EntitiesLayer(mockGc, mockScene, mockSheet); // No grid initially
		expect(layer.get(0)).toBeUndefined();

		const count = layer.spawnEntities(mockGrid);

		expect(mockCreateLevelEntities).toHaveBeenCalledWith(mockGc.resourceManager, mockGrid, mockSheet.sprites);
		expect(count).toBe(1);
		expect(layer.get(0)).toBe(mockEntities[0]);
	});

	it("should handle TASK_REMOVE_ENTITY task", () => {
		const entity1 = new MockEntity("id1");
		const entity2 = new MockEntity("id2");
		mockCreateLevelEntities.mockReturnValue([entity1, entity2] as unknown as Entity[]);
		const layer = new EntitiesLayer(mockGc, mockScene, mockSheet, mockGrid);
		expect(layer.get("id1")).toBeDefined();
		expect(layer.get("id2")).toBeDefined();

		const removeHandler = mockTaskHandlers.get(EntitiesLayer.TASK_REMOVE_ENTITY);
		expect(removeHandler).toBeDefined();
		removeHandler?.(entity1); // Simulate task emission

		expect(layer.get("id1")).toBeUndefined();
		expect(layer.get("id2")).toBeDefined(); // entity2 should remain
		expect(layer.get(0)).toBe(entity2);
	});

	it("should handle TASK_ADD_ENTITY task", () => {
		const layer = new EntitiesLayer(mockGc, mockScene, mockSheet, mockGrid);
		const newEntity = new MockEntity("id_new");
		expect(layer.get("id_new")).toBeUndefined();

		const addHandler = mockTaskHandlers.get(EntitiesLayer.TASK_ADD_ENTITY);
		expect(addHandler).toBeDefined();
		addHandler?.(newEntity); // Simulate task emission

		expect(layer.get("id_new")).toBe(newEntity);
	});

	it("should update entities and handle collisions", () => {
		const entity1 = new MockEntity("id1");
		const entity2 = new MockEntity("id2");
		mockCreateLevelEntities.mockReturnValue([entity1, entity2] as unknown as Entity[]);
		mockIntersectRect.mockReturnValue(true); // Assume they always intersect for this test
		const layer = new EntitiesLayer(mockGc, mockScene, mockSheet, mockGrid);

		layer.update(mockGc, mockScene);

		expect(entity1.update).toHaveBeenCalledWith(mockGc, mockScene);
		expect(entity2.update).toHaveBeenCalledWith(mockGc, mockScene);
		expect(mockIntersectRect).toHaveBeenCalledWith(entity1, entity2);
		expect(entity1.collides).toHaveBeenCalledWith(mockGc, entity2);
		expect(entity2.collides).not.toHaveBeenCalled(); // Collision check is one-way per pair
		expect(entity1.finalize).toHaveBeenCalled();
		expect(entity2.finalize).toHaveBeenCalled();
	});

	it("should render entities and optional info", () => {
		const entity1 = new MockEntity("id1");
		mockSheet.settings = { show_entities_count: true, show_entity_frame: true }; // Default red color
		mockCreateLevelEntities.mockReturnValue([entity1] as unknown as Entity[]);
		const layer = new EntitiesLayer(mockGc, mockScene, mockSheet, mockGrid);

		layer.render(mockGc);

		expect(entity1.render).toHaveBeenCalledWith(mockGc);
		expect(mockGc.viewport.ctx.fillText).toHaveBeenCalledWith("1", mockGc.viewport.width - 5, 12);
		expect(mockGc.viewport.ctx.strokeRect).toHaveBeenCalledWith(entity1.left, entity1.top, entity1.width, entity1.height);
		expect(mockGc.viewport.ctx.strokeStyle).toBe("red");
	});
});
