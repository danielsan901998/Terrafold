import PlanetManager from './PlanetManager';
import ShipManager from './ShipManager';
import Planet from './Planet';
import Ship from './Ship';
import { sortArrayObjectsByValue } from '../utils/utils';

export default class Space {
    planets: Planet[];
    ships: Ship[];
    sector: number;
    constructor() {
        this.planets = [];
        this.ships = [];
        this.sector = 0;
    }

    tick() {
        let empty = true;
        ShipManager.updateGlobalTarget();
        for (let i = 0; i < this.planets.length; i++) {
            const planet = this.planets[i]!;
            PlanetManager.tick(planet); // Use PlanetManager.tick
            if (PlanetManager.empty(planet) === false) // Use PlanetManager.empty
                empty = false;
        }
        if (empty && this.ships.length === 0) {
            this.planets = [];
            this.sector++;
            this.newLevel();
        }
        for (let i = 0; i < this.ships.length; i++) {
            ShipManager.tick(this.ships[i]!); // Use ShipManager.tick
        }
    }

    spawnShip(ship: Ship, y: number) {
        ship.x = -120;
        ship.y = y;
        this.ships.push(ship);
    }

    newLevel() {
        for (let i = 0; i < 10; i++) {
            const newPlanet = new Planet();
            this.planets.push(newPlanet);
        }
        sortArrayObjectsByValue(this.planets, "x");
        const lastPlanet = this.planets[this.planets.length - 1];
        if (lastPlanet) lastPlanet.isBoss = true;

        for (let i = 0; i < this.planets.length; i++) {
            PlanetManager.calcPower(this.planets[i]!, this.sector);
        }
    }
}