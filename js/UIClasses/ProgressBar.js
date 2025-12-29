export default class ProgressBar {
    constructor(id, color) {
        this.aProgress = document.getElementById(id);
        this.color = color;
    }

    tick(ticks, ticksNeeded) {
        var percentage = (ticks / ticksNeeded);
        this.reset(this.aProgress);
        this.drawProgress(this.aProgress, percentage, this.color);
    }

    reset(bar) {
        if (!bar) return;
        var barCTX = bar.getContext("2d");
        barCTX.lineCap = 'square';

        barCTX.beginPath();
        barCTX.lineWidth = 8;
        barCTX.fillStyle = '#fff';
        barCTX.arc(35, 35, 25, 0, 2 * Math.PI);
        barCTX.fill();
    }

    drawProgress(bar, percentage, color) {
        if (!bar) return;
        var barCTX = bar.getContext("2d");
        var quarterTurn = Math.PI / 2;
        var endingAngle = ((2 * percentage * .95) * Math.PI) - quarterTurn * .9; //.985 because lineWidth
        var startingAngle = 0 - quarterTurn * .9;

        barCTX.lineCap = 'square';

        barCTX.beginPath();
        barCTX.lineWidth = 8;
        barCTX.strokeStyle = color;
        barCTX.arc(35, 35, 20, startingAngle, endingAngle);
        barCTX.stroke();
    }
}