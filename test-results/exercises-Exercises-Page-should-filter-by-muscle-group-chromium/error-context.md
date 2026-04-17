# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: exercises.spec.ts >> Exercises Page >> should filter by muscle group
- Location: e2e\exercises.spec.ts:19:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByLabel('Grupo Muscular')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByLabel('Grupo Muscular')

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
      - generic [ref=e20]:
        - heading "Catálogo de Exercícios" [level=2] [ref=e21]:
          - img [ref=e22]
          - text: Catálogo de Exercícios
        - generic [ref=e24]: 0 exercícios
      - generic [ref=e26]:
        - generic [ref=e27]:
          - img [ref=e28]
          - textbox "Buscar exercício..." [ref=e31]
        - combobox [ref=e32]:
          - option "Todos os Músculos" [selected]
          - option "Peito"
          - option "Costas"
          - option "Pernas"
          - option "Ombros"
          - option "Braços"
          - option "Core"
          - option "Corpo Inteiro"
        - combobox [ref=e33]:
          - option "Todos os Equipamentos" [selected]
          - option "Barra"
          - option "Halter"
          - option "Máquina Peso"
          - option "Cabo/Polia"
          - option "Peso Corporal"
        - button "Limpar Filtros" [ref=e34]:
          - img [ref=e35]
          - text: Limpar Filtros
      - generic [ref=e37]: Carregando exercícios...
  - button "Open Next.js Dev Tools" [ref=e43] [cursor=pointer]:
    - generic [ref=e46]:
      - text: Compiling
      - generic [ref=e47]:
        - generic [ref=e48]: .
        - generic [ref=e49]: .
        - generic [ref=e50]: .
  - alert [ref=e51]
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
> 22 |     await expect(muscleFilter).toBeVisible();
     |                                ^ Error: expect(locator).toBeVisible() failed
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
  34 |     await expect(page).toHaveURL(/\/$/);
  35 |   });
  36 | });
  37 | 
```