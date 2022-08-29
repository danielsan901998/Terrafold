function Hangar(num) {
    this.num = num;
    this.sendRate = 1;
    this.timeRemaining = this.totalTime = 40;
    this.y = 350;

    this.tick = function() {
        this.timeRemaining--;
        if(this.timeRemaining < 0) {
            if (game.spaceDock.battleships > 0) {
                var tosend=Math.min(this.sendRate,game.spaceDock.battleships);
                var foodTaken = game.farms.food * .05; // Take 5% food per launch
                game.farms.food -= foodTaken;
                game.space.spawnShip(new Ship(tosend, foodTaken), this.y);
                game.spaceDock.battleships -= tosend;
                game.spaceDock.sended += tosend;
                this.timeRemaining = this.totalTime;
            } else {
                this.timeRemaining = 0;
            }
        }
    };

    this.getTarget = function() {
        return {
            isHome:true,
            x:-125,
            y:this.y,
            num:this.num
        }
    };
}
