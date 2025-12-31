export default class Ship {
    count: number;
    food: number;
    actionCounter: number;
    energy: number;
    x: number;
    y: number;
    engaged: boolean;
    direction: number;
    target: any;

    constructor(count: number, food: number, foodPerShip: number) {
        this.count = count;
        this.food = food / foodPerShip;
        this.actionCounter = 0;
        this.energy = 0;
        this.x = 0;
        this.y = 0;
        this.engaged = false;
        this.direction = 0;
        this.target = null;
    }
}
