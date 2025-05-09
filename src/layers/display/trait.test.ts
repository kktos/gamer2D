import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Entity } from "../../entities/Entity";
import { Trait } from "../../traits/Trait";
import { ArgColor, ArgVariable, ValueTrait } from "../../types/value.types";
import type { TVars } from "../../utils/vars.utils";
import { addTraits } from "./trait.manager";

// Mock Entity class
class MockEntity implements Partial<Entity> {
	id = "mock-entity";
	traits: Trait[] = [];
	addTrait = vi.fn((trait: Trait) => {
		this.traits.push(trait);
		return trait;
	});
}

class MockTrait1 extends Trait {}
class MockTrait2 extends Trait {}

vi.mock("../../script/engine/eval.script", () => ({
	evalValue: ({ vars }, val) => {
		// console.log("mock", val);
		if (!(val instanceof ValueTrait)) return undefined;
		switch (val.name) {
			case "MockFadeTrait":
				return "MockFadeTrait";
			case "MockMouseXTrait":
				return "MockMouseXTrait";
		}
	},
}));

describe("addTraits", () => {
	let mockEntity: MockEntity;
	let mockEntityArray: MockEntity[];
	let mockVars: TVars;
	let trait1: MockTrait1;
	let trait2: MockTrait2;
	let traitVar1: ArgVariable;
	let traitVar2: ArgVariable;
	let traitListVar: ArgVariable;

	beforeEach(() => {
		mockEntity = new MockEntity();
		mockEntityArray = [new MockEntity(), new MockEntity()];
		trait1 = new MockTrait1();
		trait2 = new MockTrait2();
		traitVar1 = new ArgVariable("trait1");
		traitVar2 = new ArgVariable("trait2");
		traitListVar = new ArgVariable("traitList");

		// Mock TVars
		const varMap = new Map<string, unknown>([
			["trait1", trait1],
			["trait2", trait2],
			["traitList", [traitVar1, traitVar2]], // Variable holding an array of trait variables
		]);
		mockVars = {
			get: vi.fn((key: string) => varMap.get(key)),
			set: vi.fn(),
			has: vi.fn((key: string) => varMap.has(key)),
		} as unknown as TVars;
	});

	it("should add traits to a single entity from an array of ArgVariable", () => {
		const traitsArray = [traitVar1, traitVar2];
		addTraits(traitsArray, mockEntity as unknown as Entity, mockVars);

		expect(mockEntity.addTrait).toHaveBeenCalledWith(trait1);
		expect(mockEntity.addTrait).toHaveBeenCalledWith(trait2);
	});

	it("should add traits to a single entity from a single ArgVariable resolving to an array", () => {
		addTraits(traitListVar, mockEntity as unknown as Entity, mockVars);

		expect(mockEntity.addTrait).toHaveBeenCalledWith(trait1);
		expect(mockEntity.addTrait).toHaveBeenCalledWith(trait2);
	});

	it("should add traits to an array of entities", () => {
		const traitsArray = [traitVar1];
		addTraits(traitsArray, mockEntityArray as unknown as Entity[], mockVars);

		expect(mockVars.get).toHaveBeenCalledWith("trait1");
		expect(mockEntityArray[0].addTrait).toHaveBeenCalledTimes(1);
		expect(mockEntityArray[0].addTrait).toHaveBeenCalledWith(trait1);
		expect(mockEntityArray[1].addTrait).toHaveBeenCalledTimes(1);
		expect(mockEntityArray[1].addTrait).toHaveBeenCalledWith(trait1);
	});

	it("should add traits to an array of entities from a single ArgVariable resolving to an array", () => {
		addTraits(traitListVar, mockEntityArray as unknown as Entity[], mockVars);

		expect(mockVars.get).toHaveBeenCalledWith("traitList");
		expect(mockVars.get).toHaveBeenCalledWith("trait1");
		expect(mockVars.get).toHaveBeenCalledWith("trait2");

		// Each entity gets both traits
		expect(mockEntityArray[0].addTrait).toHaveBeenCalledTimes(2);
		expect(mockEntityArray[0].addTrait).toHaveBeenCalledWith(trait1);
		expect(mockEntityArray[0].addTrait).toHaveBeenCalledWith(trait2);
		expect(mockEntityArray[1].addTrait).toHaveBeenCalledTimes(2);
		expect(mockEntityArray[1].addTrait).toHaveBeenCalledWith(trait1);
		expect(mockEntityArray[1].addTrait).toHaveBeenCalledWith(trait2);
	});

	it("should add traits to a single entity from an array of trait declarations", () => {
		const trait1 = new ValueTrait("MockFadeTrait", ["in", new ArgColor("#00000000")]);
		const trait2 = new ValueTrait("MockMouseXTrait", []);
		const traitDeclarations = [trait1, trait2];

		addTraits(traitDeclarations, mockEntity as unknown as Entity, mockVars);

		expect(mockEntity.addTrait).toHaveBeenCalledTimes(2);
		expect(mockEntity.addTrait).toHaveBeenCalledWith("MockFadeTrait");
		expect(mockEntity.addTrait).toHaveBeenCalledWith("MockMouseXTrait");
	});
});
