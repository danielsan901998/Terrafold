import PlanetManager from './PlanetManager.js';
import ShipManager from './ShipManager.js';
import Planet from './Planet.js';
import { sortArrayObjectsByValue } from '../utils.js';

export default class Space {
    constructor() {
        this.planets = [];
        this.ships = [];
        this.sector = 0;
    }

    tick() {
        var empty = true;
        for (var i = 0; i < this.planets.length; i++) {
            PlanetManager.tick(this.planets[i]); // Use PlanetManager.tick
            if (PlanetManager.empty(this.planets[i]) == false) // Use PlanetManager.empty
                empty = false;
        }
        if (empty && this.ships.length == 0) {
            this.planets = [];
            this.sector++;
            this.newLevel();
        }
        for (i = 0; i < this.ships.length; i++) {
            ShipManager.tick(this.ships[i]); // Use ShipManager.tick
        }
    }

    spawnShip(ship, y) {
        ship.x = -120;
        ship.y = y;
        this.ships.push(ship);
    }

    newLevel() {
        for (var i = 0; i < 10; i++) {
            const newPlanet = new Planet();
            this.planets.push(newPlanet);
        }
        sortArrayObjectsByValue(this.planets, "x");
        this.planets[this.planets.length - 1].isBoss = true; //rightmost planet

        for (i = 0; i < this.planets.length; i++) {
            PlanetManager.calcPower(this.planets[i], this.sector); // Use PlanetManager.calcPower
        }
    }
}
