import { expect, test, describe } from "bun:test";
import { calculateCometTrajectory } from "./cometUtils";

describe("cometUtils", () => {
    test("comet trajectory stays within viewport bounds for various inputs", () => {
        // Test ranges based on TractorBeam.ts:
        // duration: 400 to 1200 (800 + 400, or (800 + 400) * 2)
        // speed: 0.5 to 3 (random * 2 + 1, or (random * 2 + 1) / 2)
        // randomY: 0 to 1
        
        const speeds = [0.5, 1, 2, 3];
        const durations = [400, 800, 1200, 2400];
        const randomYs = [0, 0.5, 1];

        for (const speed of speeds) {
            for (const duration of durations) {
                for (const randomY of randomYs) {
                    const { startingY, endingX, slope } = calculateCometTrajectory(speed, duration, randomY);
                    
                    // The trajectory is: top = slope * left + startingY
                    // left goes from 0 to endingX
                    
                    // Verify starting point (left = 0)
                    const topAtStart = startingY;
                    expect(topAtStart).toBeGreaterThanOrEqual(0);
                    
                    // Verify ending point (left = endingX)
                    const topAtEnd = slope * endingX + startingY;
                    // topAtEnd should be approx 0 based on slope = (0 - startingY) / endingX
                    expect(Math.abs(topAtEnd)).toBeLessThan(0.000001);

                    // Since it's a linear slope from startingY to 0, 
                    // and startingY is always positive, all intermediate points are positive.
                    
                    // Verify endingX is valid (not NaN and positive)
                    expect(endingX).toBeGreaterThan(0);
                    expect(isNaN(endingX)).toBe(false);

                    // Verify slope is negative (comets go "up" towards Y=0)
                    expect(slope).toBeLessThanOrEqual(0);
                }
            }
        }
    });

    test("extreme cases for calculateCometTrajectory", () => {
        // totalDistance = speed * duration
        // startingY = randomY * (totalDistance * .4) + totalDistance * .1
        // max startingY is 0.5 * totalDistance (when randomY = 1)
        // min startingY is 0.1 * totalDistance (when randomY = 0)
        
        // Even if randomY = 1, startingY = 0.5 * totalDistance.
        // endingX = sqrt(totalDistance^2 - startingY^2) = sqrt(1 - 0.25) * totalDistance = 0.866 * totalDistance.
        // This is always valid as long as startingY < totalDistance.
        
        const { startingY, endingX } = calculateCometTrajectory(1, 1000, 1);
        expect(startingY).toBe(500);
        expect(endingX).toBeCloseTo(Math.sqrt(1000**2 - 500**2));
    });
});
