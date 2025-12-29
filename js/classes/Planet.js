import PlanetManager from './PlanetManager.js';

export default class Planet {
    constructor() {
        this.isBoss = 0;
        this.view = {};
        this.view.rotation = 0;
        this.view.rotationSpeed = Math.random();
        this.view.color = Math.floor(Math.random() * 360);
        this.view.light = Math.floor(Math.random() * 15 + 40);

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
