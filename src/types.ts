import EventEmitter from './utils/EventEmitter';
import Planet from './core/Planet';

export interface Comet {
    id: number;
    name: string;
    amount: number;
    initialAmount: number;
    amountType: string;
    duration: number;
    initialDuration: number;
    speed: number;
    drawed: boolean;
    startingY: number;
    endingX: number;
    slope: number;
    left: number;
    top: number;
}

export interface OrbitingResource {
    amount: number;
    type: string;
}

export interface HomeTarget {
    isHome: true;
    x: number;
    y: number;
}

export type Target = Planet | HomeTarget;

export interface Game {
    totalLand: number;
    cash: number;
    oxygen: number;
    science: number;
    wood: number;
    metal: number;
    ore: number;
    power: number;
    oxygenLeak: number;
    canvasWidth: number;
    canvasHeight: number;
    ice: any;
    water: any;
    clouds: any;
    land: any;
    trees: any;
    farms: any;
    population: any;
    computer: any;
    robots: any;
    energy: any;
    spaceStation: any;
    tractorBeam: any;
    spaceDock: any;
    hangar: any;
    space: any;
    dysonSwarm: any;
    events: EventEmitter;
    tick(): void;
    initialize(): void;
    buyIce(): void;
    buyBattery(): void;
    buyBattleship(): void;
    buyHangar(): void;
}
