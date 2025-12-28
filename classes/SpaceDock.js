function SpaceDock() {
    this.battleships = 0;
    this.unlocked = 0;
    this.sended = 0;

    this.addBattleship = function(amount) {
        this.battleships += amount;
        view.updateSpaceDock();
    };

}
