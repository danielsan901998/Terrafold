import { expect, test, describe, beforeEach, mock } from "bun:test";

// Mock the DOM
(global as any).document = {
    getElementById: () => ({
        getContext: () => ({}),
        style: {},
    }),
    createElement: () => ({
        style: {},
    }),
};
(global as any).window = global;
(global as any).HTMLCanvasElement = class {};

// Mock the main module BEFORE importing Energy
mock.module("../../main", () => {
    return {
        game: {
            metal: 1000,
            power: 0,
        },
        view: {
            checkEnergyUnlocked: () => {},
            checkSpaceStationUnlocked: () => {},
            updateEnergy: () => {},
        }
    };
});

import Energy from "./Energy";
import * as main from "../../main";

describe("Energy", () => {
    let energy: Energy;

    beforeEach(() => {
        energy = new Energy();
        // Reset mock state
        (main.game as any).metal = 1000;
        (main.game as any).power = 0;
    });

    test("should initialize with default values", () => {
        expect(energy.unlocked).toBe(0);
        expect(energy.battery).toBe(100);
        expect(energy.drain).toBe(0);
    });

    test("unlockEnergy should unlock when enough metal", () => {
        energy.unlockEnergy();
        expect(energy.unlocked).toBe(1);
        expect(main.game!.metal).toBe(500);
    });

    test("unlockEnergy should not unlock when not enough metal", () => {
        main.game!.metal = 100;
        energy.unlockEnergy();
        expect(energy.unlocked).toBe(0);
        expect(main.game!.metal).toBe(100);
    });

    test("tick should drain power when power exceeds battery", () => {
        main.game!.power = 200;
        energy.battery = 100;
        energy.tick();
        // excess = 200 - 100 = 100
        // drain = 100 / 500 = 0.2
        // new power = 200 - 0.2 = 199.8
        expect(energy.drain).toBe(0.2);
        expect(main.game!.power).toBeCloseTo(199.8);
    });

    test("tick should not drain power when power is below battery", () => {
        main.game!.power = 50;
        energy.battery = 100;
        energy.tick();
        expect(energy.drain).toBe(0);
        expect(main.game!.power).toBe(50);
    });

    test("gainEnergy should increase power", () => {
        energy.gainEnergy(50);
        expect(main.game!.power).toBe(50);
    });

    test("buyBattery should increase battery capacity", () => {
        energy.buyBattery(50);
        expect(energy.battery).toBe(150);
    });
});
