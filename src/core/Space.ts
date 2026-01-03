import PlanetManager from './PlanetManager';
import ShipManager from './ShipManager';
import Planet from './Planet';
import Ship from './Ship';
import { sortArrayObjectsByValue } from '../utils/utils';

export default class Space {
    planets: Planet[];
    ships: Ship[];
    sector: number;
    allEmpty: boolean;

    constructor() {
        this.planets = [];
        this.ships = [];
        this.sector = 0;
        this.allEmpty = false;
    }

    tick() {
        const targetPlanet = this.planets[ShipManager.globalTargetIndex];
        if (!targetPlanet || PlanetManager.doneBuilding(targetPlanet)) {
            ShipManager.updateGlobalTarget();
        }

        if (!this.allEmpty) {
            let empty = true;
            for (let i = 0; i < this.planets.length; i++) {
                PlanetManager.tick(this.planets[i]!);
                if (empty && !PlanetManager.empty(this.planets[i]!))
                    empty = false;
            }
            this.allEmpty = empty;
        }

        if (this.allEmpty && this.ships.length === 0) {
            this.sector++;
            this.newLevel();
        }
        for (let i = 0; i < this.ships.length; i++) {
            ShipManager.tick(this.ships[i]!);
        }
    }

    spawnShip(ship: Ship, y: number) {
        ship.x = -120;
        ship.y = y;
        this.ships.push(ship);
    }

    newLevel() {
        this.allEmpty = false;
        this.planets = [];
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
