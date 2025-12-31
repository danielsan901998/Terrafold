import { game } from '../main';
import { withinDistance, getDistance } from '../utils/utils';
import PlanetManager from './PlanetManager';
import Ship from './Ship';

export default class ShipManager {
    static foodPerShip = 20;
    static actionRate = 1;
    static actionSpeed = 40;
    static defaultSpeed = 0.5;
    static emptySpeed = 0.05;

    static tick(ship: Ship) {
        ShipManager.checkEmpty(ship);
        ShipManager.moveToNearestTarget(ship);
        ShipManager.checkJoinFleet(ship);
        ShipManager.attackTarget(ship);
    }

    static checkJoinFleet(ship: Ship) {
        if (!game || !ship.engaged) {
            return;
        }
        for (let i = game.space.ships.length - 1; i >= 0; i--) {
            const otherShip = game.space.ships[i]!;
            if (otherShip === ship || ShipManager.isEmpty(otherShip)) { // only join on same types
                continue;
            }
            if (withinDistance(ship.x, ship.y, otherShip.x, otherShip.y, 20)) {
                ShipManager.combineShips(ship, otherShip);
                game.space.ships.splice(i, 1);
            }
        }
    }

    static findClosestTarget(ship: Ship) {
        if (!game) return null;
        let pos = 0;
        let targetPlanet = null;
        for (let i = 0; i < game.space.planets.length; i++) {
            const planet = game.space.planets[i]!;
            if (PlanetManager.doneBuilding(planet)) {
                continue;
            }
            if (!targetPlanet) {
                targetPlanet = planet;
                continue;
            }
            if (getDistance(ship.x, ship.y, planet.x, planet.y) < getDistance(ship.x, ship.y, targetPlanet.x, targetPlanet.y)) {
                pos = i;
                targetPlanet = game.space.planets[pos]!;
            }
        }
        return targetPlanet ? targetPlanet : ShipManager.targetHome(ship);
    }

    static checkEmpty(ship: Ship) {
        ship.food -= ship.count;
        if (!ShipManager.isEmpty(ship)) {
            return;
        }
        ship.food = 0;
        ship.target = ShipManager.targetHome(ship);
        ship.engaged = false;
    }

    static targetHome(ship: Ship) {
        return game?.hangar.getTarget();
    }

    static returnHome(ship: Ship) {
        if (!game) return;
        game.spaceDock.battleships += ship.count;
        game.spaceDock.sended -= ship.count;
        game.farms.food += ship.food * ShipManager.foodPerShip;
        for (let i = game.space.ships.length - 1; i >= 0; i--) {
            const otherShip = game.space.ships[i];
            if (otherShip === ship) {
                game.space.ships.splice(i, 1);
                break;
            }
        }
    }

    static isEmpty(ship: Ship) {
        return ship.food <= 0;
    }

    static getSpeed(ship: Ship) {
        return ShipManager.isEmpty(ship) ? ShipManager.emptySpeed : ShipManager.defaultSpeed;
    }

    static moveToNearestTarget(ship: Ship) {
        if (!ship.target || (!ship.target.isHome && PlanetManager.doneBuilding(ship.target))) { // Use PlanetManager
            ship.target = ShipManager.findClosestTarget(ship);
            ship.engaged = false;
        }
        if (getDistance(ship.x, ship.y, ship.target.x, ship.target.y) < 40) {
            if (!ship.target.isHome) {
                ship.engaged = true;
                return;
            }
            ShipManager.returnHome(ship);
        }
        const magnitude = ShipManager.getSpeed(ship);
        let extraTurn = 0;
        const firstVC = ship.target.y - ship.y;
        const secondVC = ship.target.x - ship.x;
        if ((firstVC >= 0 && secondVC < 0) || (firstVC < 0 && secondVC < 0)) {
            extraTurn = Math.PI;
        }
        const direction = Math.atan(firstVC / secondVC) + extraTurn; // (y2-y1)/(x2-x1)
        ship.x = ship.x + magnitude * Math.cos(direction); // ||v||cos(theta)
        ship.y = ship.y + magnitude * Math.sin(direction);
        ship.direction = direction;
    }

    static attackTarget(ship: Ship) {
        if (ship.target && !ship.target.isHome && ship.engaged) {
            ship.actionCounter++;
            if (ship.actionCounter >= ShipManager.actionSpeed) {
                ship.actionCounter = 0;
                if (PlanetManager.alive(ship.target)) {
                    PlanetManager.takeDamage(ship.target, ShipManager.actionRate * ship.count);
                } else {
                    PlanetManager.workConstruction(ship.target, ship.count);
                    if (PlanetManager.doneBuilding(ship.target)) {
                        ship.engaged = false;
                        ship.target = ShipManager.findClosestTarget(ship);
                    }
                }
            }
        }
    }

    static combineShips(ship1: Ship, ship2: Ship) {
        ship1.count += ship2.count;
        ship1.energy += ship2.energy;
        ship1.food += ship2.food;
        if (ship2.actionCounter > ship1.actionCounter) {
            ship1.actionCounter = ship2.actionCounter;
        }
    }
}