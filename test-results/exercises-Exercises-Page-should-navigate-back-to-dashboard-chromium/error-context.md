# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: exercises.spec.ts >> Exercises Page >> should navigate back to dashboard
- Location: e2e\exercises.spec.ts:31:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/$/
Received string:  "http://localhost:3000/auth/login"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    3 × unexpected value "http://localhost:3000/exercises"
    6 × unexpected value "http://localhost:3000/auth/login"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]
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
  3  | test.describe("Exercises Page", () => {
  4  |   test("should load exercises page", async ({ page }) => {
  5  |     await page.goto("/exercises");
  6  |     await expect(page).toHaveTitle(/Iron Brain/);
  7  |   });
  8  | 
  9  |   test("should display exercises list", async ({ page }) => {
  10 |     await page.goto("/exercises");
  11 |     await expect(page.getByText("Catálogo de Exercícios")).toBeVisible();
  12 |   });
  13 | 
  14 |   test("should display search input", async ({ page }) => {
  15 |     await page.goto("/exercises");
  16 |     await expect(page.getByPlaceholder("Buscar exercício...")).toBeVisible();
  17 |   });
  18 | 
  19 |   test("should filter by muscle group", async ({ page }) => {
  20 |     await page.goto("/exercises");
  21 |     const muscleFilter = page.getByLabel("Grupo Muscular");
  22 |     await expect(muscleFilter).toBeVisible();
  23 |   });
  24 | 
  25 |   test("should filter by equipment type", async ({ page }) => {
  26 |     await page.goto("/exercises");
  27 |     const equipmentFilter = page.getByLabel("Equipamento");
  28 |     await expect(equipmentFilter).toBeVisible();
  29 |   });
  30 | 
  31 |   test("should navigate back to dashboard", async ({ page }) => {
  32 |     await page.goto("/exercises");
  33 |     await page.getByRole("link", { name: /Dashboard/i }).click();
> 34 |     await expect(page).toHaveURL(/\/$/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  35 |   });
  36 | });
  37 | 
```