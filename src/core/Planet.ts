import PlanetManager from './PlanetManager';

export default class Planet {
    isBoss: boolean | number = false;
    view: {
        color: number;
        light: number;
    };
    x: number;
    y: number;
    mines: number = 0;
    mineTicks: number = 0;
    ore: number = 0;
    bots: number = 0;
    factoryTicks: number = 0;
    solarTicks: number = 0;
    solar: number = 0;
    energy: number = 0;
    coilgunTicks: number = 0;
    coilgunCharge: number = 0;
    
    id?: number;
    power: number = 0;
    atmo: number = 0;
    maxAtmo: number = 0;
    health: number = 0;
    maxHealth: number = 0;
    dirt: number = 0;
    maxMines: number = 0;

    constructor() {
        this.view = {
            color: Math.floor(Math.random() * 360),
            light: Math.floor(Math.random() * 15 + 40)
        };

        this.x = PlanetManager.xAreaAllowed();
        this.y = PlanetManager.yAreaAllowed();
        
        PlanetManager.findArea(this);
    }
}
