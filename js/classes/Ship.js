import ShipManager from './ShipManager.js';

export default class Ship {
    constructor(amount, foodAmount) {
        this.amount = amount;
        this.foodAmount = foodAmount / ShipManager.foodPerShip;
        this.actionRate = 1;
        this.actionSpeed = 40;
        this.actionCounter = 0;
        this.energy = 0;
        this.speed = .5;
        this.x = 0;
        this.y = 0;
        this.engaged = false;
        this.direction = 0;
        this.target = null;
    }
}
