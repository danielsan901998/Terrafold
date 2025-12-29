import { game } from '../../main.js';
import { withinDistance, precision3 } from '../utils.js';
import { rotatePlanet } from '../UIClasses/spaceView.js';

export default class PlanetManager {
    static findArea(planet) {
        for (var i = 0; i < game.space.planets.length; i++) {
            var target = game.space.planets[i];
            if (target === planet) {
                continue;
            }
            var counter = 0;
            while (PlanetManager.withinDistance(planet, planet.x, planet.y, 75)) {
                counter++;
                if (counter > 40) {
                    console.log("too many planets");
                    return;
                }
                planet.x = PlanetManager.xAreaAllowed();
                planet.y = PlanetManager.yAreaAllowed();
            }
        }
    }

    static xAreaAllowed() {
        return Math.random() * 620;
    }

    static yAreaAllowed() {
        return Math.random() * 330 + 5;
    }

    static withinDistance(planet, x1, y1, radius) {
        for (var i = 0; i < game.space.planets.length; i++) {
            var target = game.space.planets[i];
            if (target === planet) {
                continue;
            }
            if (withinDistance(x1, y1, target.x, target.y, radius)) {
                return true;
            }
        }
        return false;
    }

    static tick(planet) {
        PlanetManager.regenShields(planet);
        PlanetManager.tickResources(planet);
        rotatePlanet(planet); // assuming rotatePlanet is a global or helper function
    }

    static empty(planet) {
        return planet.dirt <= 0;
    }

    static alive(planet) {
        return planet.health > 0;
    }

    static regenShields(planet) {
        if (!PlanetManager.alive(planet)) {
            planet.atmo = 0;
            return;
        }
        planet.atmo += (planet.maxAtmo - planet.atmo) / 100;
        if (planet.atmo > planet.maxAtmo) {
            planet.atmo = planet.maxAtmo;
        }
    }

    static getShieldReduction(planet) {
        return planet.atmo / planet.maxAtmo;
    }

    static takeDamage(planet, damage) {
        var healthDamage = damage * (1 - PlanetManager.getShieldReduction(planet));
        planet.atmo -= damage * PlanetManager.getShieldReduction(planet);
        var extraDamage = 0;
        if (planet.atmo < 0) {
            extraDamage = planet.atmo * -1;
            planet.atmo = 0;
        }

        planet.health -= healthDamage + extraDamage;
        if (planet.health < 0) {
            planet.health = 0;
        }
    }

    static calcPower(planet, difficulty) { //difficulty starts at 1
        planet.power = difficulty * (planet.isBoss ? 1.5 : 1);
        //limit max atmosphere to avoid drawing to become to too big
        planet.atmo = planet.maxAtmo = Math.min(200, precision3((planet.power * 2) + 100));
        planet.health = planet.maxHealth = precision3((planet.power * 20) + 1000);
        planet.dirt = precision3((planet.power * 200) + 2000);

        planet.mineTicksMax = 2000;
        planet.factoryTicksMax = 8000;
        planet.maxMines = Math.floor((planet.dirt + .1) / 1000);
        planet.solarTicksMax = 1000;
        planet.coilgunTicksMax = 1000;
    }

    static workConstruction(planet, amount) { //Comes from ships
        if (!PlanetManager.doneFactory(planet)) {
            PlanetManager.workOnFactory(planet, amount);
            return;
        }
        if (!PlanetManager.doneCoilgun(planet)) {
            PlanetManager.workOnCoilgun(planet, amount);
            return;
        }
        PlanetManager.workOnMine(planet, amount);
    }

    static tickResources(planet) {
        if (PlanetManager.empty(planet)) {
            return;
        }
        PlanetManager.tickMines(planet);
        PlanetManager.tickBots(planet);
        PlanetManager.tickFactory(planet);
        PlanetManager.tickSolar(planet);
        PlanetManager.tickCoilgun(planet);
    }

    static doneBuilding(planet) {
        return planet.mines >= planet.maxMines;
    }

    static workOnMine(planet, amount) {
        planet.mineTicks += amount;
        if (planet.mineTicks >= planet.mineTicksMax) {
            var toAdd = Math.floor(planet.mineTicks / planet.mineTicksMax);
            toAdd = Math.min(toAdd, planet.maxMines - planet.mines);
            planet.mines += toAdd;
            planet.mineTicks -= toAdd * planet.mineTicksMax;
        }
    }

    static tickMines(planet) {
        planet.ore += planet.mines;
    }

    static tickBots(planet) {
        var botWork = planet.bots;
        planet.ore -= botWork;
        PlanetManager.workOnSolar(planet, botWork);
    }

    static doneFactory(planet) {
        return planet.factoryTicks >= planet.factoryTicksMax;
    }

    static workOnFactory(planet, amount) {
        planet.factoryTicks += amount;
    }

    static tickFactory(planet) {
        if (planet.ore >= 200) {
            const toAdd = Math.floor(planet.ore / 200);
            planet.bots += toAdd;
            planet.ore -= toAdd * 200;
        }
    }

    static workOnSolar(planet, amount) {
        planet.solarTicks += amount;
        if (planet.solarTicks >= planet.solarTicksMax) {
            const toAdd = Math.floor(planet.solarTicks / planet.solarTicksMax);
            planet.solar += toAdd;
            planet.solarTicks -= toAdd * planet.solarTicksMax;
        }
    }

    static tickSolar(planet) {
        planet.coilgunCharge += planet.solar;
    }

    static doneCoilgun(planet) {
        return planet.coilgunTicks >= planet.coilgunTicksMax;
    }

    static workOnCoilgun(planet, amount) {
        planet.coilgunTicks += amount;
    }

    static tickCoilgun(planet) {
        if (planet.coilgunCharge >= planet.coilgunChargeMax) {
            const toAdd = Math.floor(planet.coilgunCharge / planet.coilgunChargeMax);
            planet.coilgunCharge -= toAdd * planet.coilgunChargeMax;
            var loadSize = 500 * toAdd;
            if (planet.dirt <= loadSize) {
                loadSize = planet.dirt;
            }
            planet.dirt -= loadSize;
            //TODO create a meteorite and launch it instead
            game.spaceStation.orbiting[1].amount += loadSize
        }
    }
}
