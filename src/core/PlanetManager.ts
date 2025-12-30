import { game } from '../main';
import { withinDistance, precision3 } from '../utils/utils';
import { rotatePlanet } from '../ui/spaceView';
import Planet from './Planet';

export default class PlanetManager {
    static findArea(planet: Planet) {
        if (!game) return;
        for (let i = 0; i < game.space.planets.length; i++) {
            const target = game.space.planets[i];
            if (target === planet) {
                continue;
            }
            let counter = 0;
            while (PlanetManager.isWithinDistanceOfAny(planet, planet.x, planet.y, 75)) {
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

    static isWithinDistanceOfAny(planet: Planet, x1: number, y1: number, radius: number) {
        if (!game) return false;
        for (let i = 0; i < game.space.planets.length; i++) {
            const target = game.space.planets[i]!;
            if (target === planet) {
                continue;
            }
            if (withinDistance(x1, y1, target.x, target.y, radius)) {
                return true;
            }
        }
        return false;
    }

    static tick(planet: any) {
        PlanetManager.regenShields(planet);
        PlanetManager.tickResources(planet);
        rotatePlanet(planet); // assuming rotatePlanet is a global or helper function
    }

    static empty(planet: any) {
        return planet.dirt <= 0;
    }

    static alive(planet: any) {
        return planet.health > 0;
    }

    static regenShields(planet: any) {
        if (!PlanetManager.alive(planet)) {
            planet.atmo = 0;
            return;
        }
        planet.atmo += (planet.maxAtmo - planet.atmo) / 100;
        if (planet.atmo > planet.maxAtmo) {
            planet.atmo = planet.maxAtmo;
        }
    }

    static getShieldReduction(planet: any) {
        return planet.atmo / planet.maxAtmo;
    }

    static takeDamage(planet: any, damage: number) {
        const healthDamage = damage * (1 - PlanetManager.getShieldReduction(planet));
        planet.atmo -= damage * PlanetManager.getShieldReduction(planet);
        let extraDamage = 0;
        if (planet.atmo < 0) {
            extraDamage = planet.atmo * -1;
            planet.atmo = 0;
        }

        planet.health -= healthDamage + extraDamage;
        if (planet.health < 0) {
            planet.health = 0;
        }
    }

    static calcPower(planet: any, difficulty: number) { // difficulty starts at 1
        planet.power = difficulty * (planet.isBoss ? 1.5 : 1);
        // limit max atmosphere to avoid drawing to become to too big
        planet.atmo = planet.maxAtmo = Math.min(200, precision3((planet.power * 2) + 100));
        planet.health = planet.maxHealth = precision3((planet.power * 20) + 1000);
        planet.dirt = precision3((planet.power * 200) + 2000);

        planet.mineTicksMax = 2000;
        planet.factoryTicksMax = 8000;
        planet.maxMines = Math.floor((planet.dirt + .1) / 1000);
        planet.solarTicksMax = 1000;
        planet.coilgunTicksMax = 1000;
    }

    static workConstruction(planet: any, amount: number) { // Comes from ships
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

    static tickResources(planet: any) {
        if (PlanetManager.empty(planet)) {
            return;
        }
        PlanetManager.tickMines(planet);
        PlanetManager.tickBots(planet);
        PlanetManager.tickFactory(planet);
        PlanetManager.tickSolar(planet);
        PlanetManager.tickCoilgun(planet);
    }

    static doneBuilding(planet: any) {
        return planet.mines >= planet.maxMines;
    }

    static workOnMine(planet: any, amount: number) {
        planet.mineTicks += amount;
        if (planet.mineTicks >= planet.mineTicksMax) {
            let toAdd = Math.floor(planet.mineTicks / planet.mineTicksMax);
            toAdd = Math.min(toAdd, planet.maxMines - planet.mines);
            planet.mines += toAdd;
            planet.mineTicks -= toAdd * planet.mineTicksMax;
        }
    }

    static tickMines(planet: any) {
        planet.ore += planet.mines;
    }

    static tickBots(planet: any) {
        const botWork = planet.bots;
        planet.ore -= botWork;
        PlanetManager.workOnSolar(planet, botWork);
    }

    static doneFactory(planet: any) {
        return planet.factoryTicks >= planet.factoryTicksMax;
    }

    static workOnFactory(planet: any, amount: number) {
        planet.factoryTicks += amount;
    }

    static tickFactory(planet: any) {
        if (planet.ore >= 200) {
            const toAdd = Math.floor(planet.ore / 200);
            planet.bots += toAdd;
            planet.ore -= toAdd * 200;
        }
    }

    static workOnSolar(planet: any, amount: number) {
        planet.solarTicks += amount;
        if (planet.solarTicks >= planet.solarTicksMax) {
            const toAdd = Math.floor(planet.solarTicks / planet.solarTicksMax);
            planet.solar += toAdd;
            planet.solarTicks -= toAdd * planet.solarTicksMax;
        }
    }

    static tickSolar(planet: any) {
        planet.coilgunCharge += planet.solar;
    }

    static doneCoilgun(planet: any) {
        return planet.coilgunTicks >= planet.coilgunTicksMax;
    }

    static workOnCoilgun(planet: any, amount: number) {
        planet.coilgunTicks += amount;
    }

    static tickCoilgun(planet: any) {
        if (planet.coilgunCharge >= planet.coilgunChargeMax) {
            const toAdd = Math.floor(planet.coilgunCharge / planet.coilgunChargeMax);
            planet.coilgunCharge -= toAdd * planet.coilgunChargeMax;
            let loadSize = 500 * toAdd;
            if (planet.dirt <= loadSize) {
                loadSize = planet.dirt;
            }
            planet.dirt -= loadSize;
            // TODO create a meteorite and launch it instead
            if (game && game.spaceStation.orbiting[1]) game.spaceStation.orbiting[1].amount += loadSize
        }
    }
}