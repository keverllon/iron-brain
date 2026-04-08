import { describe, it, expect } from "vitest";
import {
  calculateOneRMBrzycki,
  calculateOneRMEpley,
  calculateOneRM,
  calculateWeeklyVolume,
  calculateProgressiveOverload,
  getVolumeRecommendation,
} from "../training-utils";

describe("calculateOneRMBrzycki", () => {
  it("should calculate 1RM correctly with 1 rep", () => {
    expect(calculateOneRMBrzycki(100, 1)).toBe(100);
  });

  it("should calculate 1RM correctly with 10 reps", () => {
    const result = calculateOneRMBrzycki(80, 10);
    expect(result).toBeCloseTo(106.67, 1);
  });

  it("should return weight for reps >= 37", () => {
    expect(calculateOneRMBrzycki(80, 37)).toBe(80);
  });

  it("should return 0 for invalid inputs", () => {
    expect(calculateOneRMBrzycki(0, 10)).toBe(0);
    expect(calculateOneRMBrzycki(80, 0)).toBe(0);
  });
});

describe("calculateOneRMEpley", () => {
  it("should calculate 1RM correctly with 1 rep", () => {
    expect(calculateOneRMEpley(100, 1)).toBe(100);
  });

  it("should calculate 1RM correctly with 10 reps", () => {
    const result = calculateOneRMEpley(80, 10);
    expect(result).toBeCloseTo(106.67, 1);
  });

  it("should return 0 for invalid inputs", () => {
    expect(calculateOneRMEpley(0, 10)).toBe(0);
    expect(calculateOneRMEpley(80, 0)).toBe(0);
  });
});

describe("calculateOneRM", () => {
  it("should return average of Brzycki and Epley", () => {
    const result = calculateOneRM(80, 10);
    const brzycki = calculateOneRMBrzycki(80, 10);
    const epley = calculateOneRMEpley(80, 10);
    expect(result.average).toBeCloseTo((brzycki + epley) / 2, 1);
  });

  it("should return exact weight for 1 rep", () => {
    expect(calculateOneRM(100, 1).average).toBe(100);
  });

  it("should return rounded values", () => {
    const result = calculateOneRM(80, 10);
    expect(result.brzycki).toBe(Math.round(result.brzycki * 10) / 10);
    expect(result.epley).toBe(Math.round(result.epley * 10) / 10);
    expect(result.average).toBe(Math.round(result.average * 10) / 10);
  });
});

describe("calculateWeeklyVolume", () => {
  it("should calculate volume correctly", () => {
    const sessions = [
      {
        exercises: [
          {
            exercise: { name: "Supino", muscleGroup: "CHEST" },
            targetSets: 2,
            targetReps: "10",
            actualReps: null,
            weightLifted: 60,
          },
        ],
      },
    ];

    const result = calculateWeeklyVolume(sessions as any);
    expect(result.muscleGroups.length).toBe(1);
    expect(result.muscleGroups[0].muscleGroup).toBe("CHEST");
    expect(result.muscleGroups[0].totalSets).toBe(2);
    expect(result.muscleGroups[0].exercises).toContain("Supino");
  });

  it("should return empty muscleGroups for empty sessions", () => {
    const result = calculateWeeklyVolume([]);
    expect(result.muscleGroups).toEqual([]);
    expect(result.totalWeeklySets).toBe(0);
  });
});

describe("calculateProgressiveOverload", () => {
  it("should recommend INCREASE when reps completed and RPE < 8 (RPE <= 6)", () => {
    const result = calculateProgressiveOverload(60, 10, 10, 6);
    expect(result.action).toBe("INCREASE");
    expect(result.newWeight).toBe(65);
  });

  it("should recommend INCREASE with 2.5kg when RPE is 7", () => {
    const result = calculateProgressiveOverload(60, 10, 10, 7);
    expect(result.action).toBe("INCREASE");
    expect(result.newWeight).toBe(62.5);
  });

  it("should recommend MAINTAIN when RPE is 8-9", () => {
    const result = calculateProgressiveOverload(60, 10, 10, 8);
    expect(result.action).toBe("MAINTAIN");
    expect(result.newWeight).toBe(60);
  });

  it("should recommend DELOAD when RPE >= 10", () => {
    const result = calculateProgressiveOverload(60, 8, 10, 10);
    expect(result.action).toBe("DELOAD");
    expect(result.newWeight).toBe(54);
  });
});

describe("getVolumeRecommendation", () => {
  it("should return beginner recommendations", () => {
    const result = getVolumeRecommendation("BEGINNER");
    expect(result.minSets).toBe(8);
    expect(result.maxSets).toBe(12);
    expect(result.recommendedFrequency).toContain("FullBody");
  });

  it("should return intermediate recommendations", () => {
    const result = getVolumeRecommendation("INTERMEDIATE");
    expect(result.minSets).toBe(12);
    expect(result.maxSets).toBe(16);
    expect(result.recommendedFrequency).toContain("PPL");
  });

  it("should return advanced recommendations", () => {
    const result = getVolumeRecommendation("ADVANCED");
    expect(result.minSets).toBe(16);
    expect(result.maxSets).toBe(22);
    expect(result.recommendedFrequency).toContain("Bro-Split");
  });
});
