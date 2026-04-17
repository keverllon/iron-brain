# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: workouts.spec.ts >> Workouts Page >> should navigate back to dashboard
- Location: e2e\workouts.spec.ts:20:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/$/
Received string:  "http://localhost:3000/auth/login"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    3 × unexpected value "http://localhost:3000/workouts"
    6 × unexpected value "http://localhost:3000/auth/login"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]: IRON BRAIN
  - generic [ref=e13]:
    - generic [ref=e14]:
      - generic [ref=e15]:
        - img [ref=e16]
        - heading "IRON BRAIN" [level=1] [ref=e22]
      - paragraph [ref=e23]: Faça login para continuar
    - generic [ref=e24]:
      - heading "Login" [level=2] [ref=e25]
      - generic [ref=e26]:
        - generic [ref=e27]:
          - generic [ref=e28]: Email
          - textbox "seu@email.com" [ref=e29]
        - generic [ref=e30]:
          - generic [ref=e31]: Senha
          - generic [ref=e32]:
            - textbox "Sua senha" [ref=e33]
            - button [ref=e34]:
              - img [ref=e35]
        - button "Entrar" [ref=e38]
      - paragraph [ref=e40]:
        - text: Não tem conta?
        - link "Cadastre-se" [ref=e41] [cursor=pointer]:
          - /url: /auth/register
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
  16 |     await page.getByRole("link", { name: /Registrar Treino/i }).click();
  17 |     await expect(page).toHaveURL(/\/workouts\/log/);
  18 |   });
  19 | 
  20 |   test("should navigate back to dashboard", async ({ page }) => {
  21 |     await page.goto("/workouts");
  22 |     await page.getByRole("link", { name: /Dashboard/i }).click();
> 23 |     await expect(page).toHaveURL(/\/$/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
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