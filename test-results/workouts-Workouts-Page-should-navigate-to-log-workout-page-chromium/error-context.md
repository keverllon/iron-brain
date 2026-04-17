# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: workouts.spec.ts >> Workouts Page >> should navigate to log workout page
- Location: e2e\workouts.spec.ts:14:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('link', { name: /Registrar Treino/i })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - link "IRON BRAIN" [ref=e5] [cursor=pointer]:
          - /url: /
          - img [ref=e6]
          - heading "IRON BRAIN" [level=1] [ref=e12]
        - navigation [ref=e13]:
          - link "Dashboard" [ref=e14] [cursor=pointer]:
            - /url: /
          - link "Exercícios" [ref=e15] [cursor=pointer]:
            - /url: /exercises
          - link "Treinos" [ref=e16] [cursor=pointer]:
            - /url: /workouts
          - link "Progresso" [ref=e17] [cursor=pointer]:
            - /url: /progress
          - link "Entrar" [ref=e18] [cursor=pointer]:
            - /url: /auth/login
    - main [ref=e19]:
      - heading "Central de Treinos" [level=2] [ref=e20]
      - generic [ref=e21]:
        - button "Meus Treinos" [ref=e22]:
          - img [ref=e23]
          - text: Meus Treinos
        - button "Gerar Treino" [ref=e29]:
          - img [ref=e30]
          - text: Gerar Treino
        - button "Calcular 1RM" [ref=e32]:
          - img [ref=e33]
          - text: Calcular 1RM
      - generic [ref=e35]:
        - img [ref=e36]
        - heading "Faça login primeiro" [level=3] [ref=e38]
        - paragraph [ref=e39]: Você precisa estar logado para ver seus treinos.
        - link "Entrar" [ref=e40] [cursor=pointer]:
          - /url: /auth/login
  - button "Open Next.js Dev Tools" [ref=e46] [cursor=pointer]:
    - img [ref=e47]
  - alert [ref=e50]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Workouts Page", () => {
  4  |   test("should load workouts page", async ({ page }) => {
  5  |     await page.goto("/workouts");
  6  |     await expect(page).toHaveTitle(/Iron Brain/);
  7  |   });
  8  | 
  9  |   test("should display workout tabs", async ({ page }) => {
  10 |     await page.goto("/workouts");
  11 |     await expect(page.getByText("Central de Treinos")).toBeVisible();
  12 |   });
  13 | 
  14 |   test("should navigate to log workout page", async ({ page }) => {
  15 |     await page.goto("/workouts");
> 16 |     await page.getByRole("link", { name: /Registrar Treino/i }).click();
     |                                                                 ^ Error: locator.click: Test timeout of 30000ms exceeded.
  17 |     await expect(page).toHaveURL(/\/workouts\/log/);
  18 |   });
  19 | 
  20 |   test("should navigate back to dashboard", async ({ page }) => {
  21 |     await page.goto("/workouts");
  22 |     await page.getByRole("link", { name: /Dashboard/i }).click();
  23 |     await expect(page).toHaveURL(/\/$/);
  24 |   });
  25 | });
  26 | 
  27 | test.describe("Log Workout Page", () => {
  28 |   test("should load log workout page", async ({ page }) => {
  29 |     await page.goto("/workouts/log");
  30 |     await expect(page).toHaveTitle(/Iron Brain/);
  31 |   });
  32 | 
  33 |   test("should display exercise selector", async ({ page }) => {
  34 |     await page.goto("/workouts/log");
  35 |     await expect(page.getByText("Adicionar Exercício")).toBeVisible();
  36 |   });
  37 | 
  38 |   test("should display progress bar", async ({ page }) => {
  39 |     await page.goto("/workouts/log");
  40 |     await expect(page.getByText("Progresso do Treino")).toBeVisible();
  41 |   });
  42 | });
  43 | 
```