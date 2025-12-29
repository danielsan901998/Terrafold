import { game } from '../../main';
import { withinDistance, getDistance } from '../utils';
import PlanetManager from './PlanetManager';

export default class ShipManager {
    static foodPerShip = 20;

    static tick(ship: any) {
        ShipManager.checkEmpty(ship);
        ShipManager.moveToNearestTarget(ship);
        ShipManager.checkJoinFleet(ship);
        ShipManager.attackTarget(ship);
    }

    static checkJoinFleet(ship: any) {
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

    static findClosestTarget(ship: any) {
        if (!game) return null;
        let pos = 0;
        let targetPlanet = null;
        for (let i = 0; i < game.space.planets.length; i++) {
            const planet = game.space.planets[i]!;
            // Use PlanetManager functions
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

    static checkEmpty(ship: any) {
        ship.foodAmount -= ship.amount;
        if (!ShipManager.isEmpty(ship)) {
            return;
        }
        ship.foodAmount = 0;
        ship.speed = .05;
        ship.target = ShipManager.targetHome(ship);
        ship.engaged = false;
    }

    static targetHome(ship: any) {
        return game?.hangar.getTarget();
    }

    static returnHome(ship: any) {
        if (!game) return;
        game.spaceDock.battleships += ship.amount;
        game.spaceDock.sended -= ship.amount;
        game.farms.food += ship.foodAmount * ShipManager.foodPerShip;
        for (let i = game.space.ships.length - 1; i >= 0; i--) {
            const otherShip = game.space.ships[i];
            if (otherShip === ship) {
                game.space.ships.splice(i, 1);
                break;
            }
        }
    }

    static isEmpty(ship: any) {
        return ship.foodAmount <= 0;
    }

    static moveToNearestTarget(ship: any) {
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
        const magnitude = ship.speed;
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

    static attackTarget(ship: any) {
        if (ship.target && !ship.target.isHome && ship.engaged) {
            ship.actionCounter++;
            if (ship.actionCounter >= ship.actionSpeed) {
                ship.actionCounter = 0;
                // Use PlanetManager functions
                if (PlanetManager.alive(ship.target)) {
                    PlanetManager.takeDamage(ship.target, ship.actionRate * ship.amount);
                } else {
                    PlanetManager.workConstruction(ship.target, ship.amount);
                    if (PlanetManager.doneBuilding(ship.target)) {
                        ship.engaged = false;
                        ship.target = ShipManager.findClosestTarget(ship);
                    }
                }
            }
        }
    }

    static combineShips(ship1: any, ship2: any) {
        ship1.amount += ship2.amount;
        ship1.energy += ship2.energy;
        ship1.foodAmount += ship2.foodAmount;
        if (ship2.actionCounter > ship1.actionCounter) {
            ship1.actionCounter = ship2.actionCounter;
        }
    }
}