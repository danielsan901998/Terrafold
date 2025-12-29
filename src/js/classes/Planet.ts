import PlanetManager from './PlanetManager';

export default class Planet {
    isBoss: boolean | number;
    view: {
        rotation: number;
        rotationSpeed: number;
        color: number;
        light: number;
    };
    x: number;
    y: number;
    mines: number;
    mineTicks: number;
    ore: number;
    bots: number;
    factoryTicks: number;
    solarTicks: number;
    solar: number;
    energy: number;
    coilgunTicks: number;
    coilgunCharge: number;
    coilgunChargeMax: number;
    id?: number;
    power?: number;
    initialPower?: number;
    shield?: number;
    initialShield?: number;
    atmosphere?: number;
    initialAtmosphere?: number;

    constructor() {
        this.isBoss = 0;
        this.view = {
            rotation: 0,
            rotationSpeed: Math.random(),
            color: Math.floor(Math.random() * 360),
            light: Math.floor(Math.random() * 15 + 40)
        };

        this.x = PlanetManager.xAreaAllowed(); // Use manager function for initial position
        this.y = PlanetManager.yAreaAllowed();
        PlanetManager.findArea(this); // Use manager function to adjust position

        this.mines = 0;
        this.mineTicks = 0;
        this.ore = 0;
        this.bots = 0;
        this.factoryTicks = 0;
        this.solarTicks = 0;
        this.solar = 0;
        this.energy = 0;
        this.coilgunTicks = 0;
        this.coilgunCharge = 0;
        this.coilgunChargeMax = 1000;
    }
}