import { expect, test, describe } from "bun:test";
import { round1, round2, formatNumber, getDistance, sortArrayObjectsByValue, encode, decode } from "./utils";

describe("utils", () => {
  test("round1 rounds to 1 decimal place", () => {
    expect(round1(1.234)).toBe(1.2);
    expect(round1(1.26)).toBe(1.2);
  });

  test("round2 rounds to 2 decimal places", () => {
    expect(round2(1.234)).toBe(1.23);
    expect(round2(1.236)).toBe(1.23);
  });

  test("formatNumber adds commas", () => {
    expect(formatNumber(1000)).toBe("1,000");
    expect(formatNumber(1234567)).toBe("1,234,567");
  });

  test("getDistance calculates distance correctly", () => {
    expect(getDistance(0, 0, 3, 4)).toBe(5);
  });

  test("sortArrayObjectsByValue sorts correctly", () => {
    const arr = [{ x: 10 }, { x: 5 }, { x: 20 }];
    sortArrayObjectsByValue(arr, "x");
    expect(arr).toEqual([{ x: 5 }, { x: 10 }, { x: 20 }]);
  });

  test("encode and decode are reversible", async () => {
    const original = JSON.stringify({ a: 1, b: "test", c: [1, 2, 3] });
    const encoded = await encode(original);
    expect(typeof encoded).toBe("string");
    expect(encoded.length).toBeGreaterThan(0);
    const decoded = await decode(encoded);
    expect(decoded).toBe(original);
  });

  test("decode handles uncompressed JSON", async () => {
    const json = '{"totalLand":1000,"cash":100}';
    const decoded = await decode(json);
    expect(decoded).toBe(json);
  });
});
