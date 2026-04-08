import { describe, it, expect } from "vitest";
import {
  calculateOneRM,
  calculateOneRMBrzycki,
  calculateOneRMEpley,
  calculatePercentageOfOneRM,
} from "../../../../lib/training-utils";

describe("One RM API Integration", () => {
  describe("POST /api/calculate/one-rm - Logic Tests", () => {
    it("should calculate 1RM correctly with Brzycki formula", () => {
      // 100kg x 5 reps should give ~112.5kg (Brzycki)
      const result = calculateOneRMBrzycki(100, 5);
      expect(result).toBeGreaterThan(100);
      expect(result).toBeLessThan(120);
    });

    it("should return weight as 1RM when reps is 1", () => {
      const result = calculateOneRM(100, 1);
      expect(result.brzycki).toBe(100);
      expect(result.epley).toBe(100);
      expect(result.average).toBe(100);
    });

    it("should calculate higher 1RM with more reps at same weight", () => {
      const result5Reps = calculateOneRM(100, 5);
      const result10Reps = calculateOneRM(100, 10);
      expect(result10Reps.average).toBeGreaterThan(result5Reps.average);
    });

    it("should calculate percentage of 1RM correctly", () => {
      const oneRM = 100;
      const eightyPercent = calculatePercentageOfOneRM(oneRM, 80);
      expect(eightyPercent).toBe(80);
    });

    it("should handle edge case of 0 reps gracefully", () => {
      const result = calculateOneRM(100, 0);
      expect(result.brzycki).toBe(0);
      expect(result.epley).toBe(0);
      expect(result.average).toBe(0);
    });

    it("should return consistent results between Brzycki and Epley", () => {
      const result = calculateOneRM(100, 8);
      // Both formulas should give reasonable results
      expect(result.brzycki).toBeGreaterThan(0);
      expect(result.epley).toBeGreaterThan(0);
      // Average should be between the two
      expect(result.average).toBe((result.brzycki + result.epley) / 2);
    });
  });
});
