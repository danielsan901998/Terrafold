import EventEmitter from './EventEmitter';

export interface Comet {
    id: number;
    name: string;
    amount: number;
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

export interface Game {
    totalLand: number;
    cash: number;
    oxygen: number;
    science: number;
    wood: number;
    metal: number;
    power: number;
    oxygenLeak: number;
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
    events: EventEmitter;
    tick(): void;
    initialize(): void;
    buyIce(): void;
    buyFarms(): void;
    buyBattery(): void;
    buyBattleship(): void;
    buyHangar(): void;
}
