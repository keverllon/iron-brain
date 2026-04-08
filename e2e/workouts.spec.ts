import { test, expect } from "@playwright/test";

test.describe("Workouts Page", () => {
  test("should load workouts page", async ({ page }) => {
    await page.goto("/workouts");
    await expect(page).toHaveTitle(/Iron Brain/);
  });

  test("should display workout tabs", async ({ page }) => {
    await page.goto("/workouts");
    await expect(page.getByText("Central de Treinos")).toBeVisible();
  });

  test("should navigate to log workout page", async ({ page }) => {
    await page.goto("/workouts");
    await page.getByRole("link", { name: /Registrar Treino/i }).click();
    await expect(page).toHaveURL(/\/workouts\/log/);
  });

  test("should navigate back to dashboard", async ({ page }) => {
    await page.goto("/workouts");
    await page.getByRole("link", { name: /Dashboard/i }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("Log Workout Page", () => {
  test("should load log workout page", async ({ page }) => {
    await page.goto("/workouts/log");
    await expect(page).toHaveTitle(/Iron Brain/);
  });

  test("should display exercise selector", async ({ page }) => {
    await page.goto("/workouts/log");
    await expect(page.getByText("Adicionar Exercício")).toBeVisible();
  });

  test("should display progress bar", async ({ page }) => {
    await page.goto("/workouts/log");
    await expect(page.getByText("Progresso do Treino")).toBeVisible();
  });
});
