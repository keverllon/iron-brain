import { test, expect } from "@playwright/test";

test.describe("Exercises Page", () => {
  test("should load exercises page", async ({ page }) => {
    await page.goto("/exercises");
    await expect(page).toHaveTitle(/Iron Brain/);
  });

  test("should display exercises list", async ({ page }) => {
    await page.goto("/exercises");
    await expect(page.getByText("Catálogo de Exercícios")).toBeVisible();
  });

  test("should display search input", async ({ page }) => {
    await page.goto("/exercises");
    await expect(page.getByPlaceholder("Buscar exercício...")).toBeVisible();
  });

  test("should filter by muscle group", async ({ page }) => {
    await page.goto("/exercises");
    const muscleFilter = page.getByLabel("Grupo Muscular");
    await expect(muscleFilter).toBeVisible();
  });

  test("should filter by equipment type", async ({ page }) => {
    await page.goto("/exercises");
    const equipmentFilter = page.getByLabel("Equipamento");
    await expect(equipmentFilter).toBeVisible();
  });

  test("should navigate back to dashboard", async ({ page }) => {
    await page.goto("/exercises");
    await page.getByRole("link", { name: /Dashboard/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
