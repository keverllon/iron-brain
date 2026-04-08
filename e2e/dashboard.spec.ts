import { test, expect } from "@playwright/test";

test.describe("Dashboard Page", () => {
  test("should load dashboard with correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Iron Brain/);
  });

  test("should display navigation links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /Dashboard/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Exercícios/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Treinos/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Progresso/i })).toBeVisible();
  });

  test("should display Iron Brain logo", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("IRON BRAIN")).toBeVisible();
  });

  test("should navigate to exercises page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Exercícios/i }).click();
    await expect(page).toHaveURL(/\/exercises/);
  });

  test("should navigate to workouts page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Treinos/i }).click();
    await expect(page).toHaveURL(/\/workouts/);
  });

  test("should navigate to progress page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Progresso/i }).click();
    await expect(page).toHaveURL(/\/progress/);
  });
});
