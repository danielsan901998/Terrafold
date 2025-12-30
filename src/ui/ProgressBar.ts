export default class ProgressBar {
    aProgress: HTMLCanvasElement | null;
    color: string;
    private lastPercentage: number = -1;

    constructor(id: string, color: string) {
        this.aProgress = document.getElementById(id) as HTMLCanvasElement;
        this.color = color;
    }

    tick(ticks: number, ticksNeeded: number) {
        if (!this.aProgress) return;
        const percentage = (ticks / ticksNeeded);
        if (Math.abs(this.lastPercentage - percentage) < 0.001) return;
        this.lastPercentage = percentage;
        
        this.reset(this.aProgress);
        this.drawProgress(this.aProgress, percentage, this.color);
    }

    reset(bar: HTMLCanvasElement) {
        if (!bar) return;
        const barCTX = bar.getContext("2d");
        if (!barCTX) return;
        barCTX.lineCap = 'square';

        const center = bar.width / 2;
        const radius = (bar.width / 2) - 5;

        barCTX.beginPath();
        barCTX.lineWidth = 8;
        barCTX.fillStyle = '#1e1e1e'; // Matches --card-bg
        barCTX.arc(center, center, radius, 0, 2 * Math.PI);
        barCTX.fill();
    }

    drawProgress(bar: HTMLCanvasElement, percentage: number, color: string) {
        if (!bar) return;
        const barCTX = bar.getContext("2d");
        if (!barCTX) return;
        const quarterTurn = Math.PI / 2;
        const endingAngle = ((2 * percentage * .95) * Math.PI) - quarterTurn * .9; //.985 because lineWidth
        const startingAngle = 0 - quarterTurn * .9;

        const center = bar.width / 2;
        const radius = (bar.width / 2) - 10;

        barCTX.lineCap = 'square';

        barCTX.beginPath();
        barCTX.lineWidth = 8;
        barCTX.strokeStyle = color;
        barCTX.arc(center, center, radius, startingAngle, endingAngle);
        barCTX.stroke();
    }
}
