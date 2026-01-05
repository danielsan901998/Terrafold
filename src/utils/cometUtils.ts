export function calculateCometTrajectory(speed: number, duration: number, randomY: number) {
    const totalDistance = speed * duration;
    const startingY = randomY * (totalDistance * .4) + totalDistance * .1;
    const endingX = Math.pow(Math.pow(totalDistance, 2) - Math.pow(startingY, 2), .5);
    const slope = (0 - startingY) / (endingX);
    return { startingY, endingX, slope };
}
