# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: exercises.spec.ts >> Exercises Page >> should filter by equipment type
- Location: e2e\exercises.spec.ts:25:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByLabel('Equipamento')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByLabel('Equipamento')

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
        - generic [ref=e24]: 14 exercícios
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
      - generic [ref=e37]:
        - generic [ref=e38]:
          - generic [ref=e39]:
            - heading "Agachamento Livre" [level=3] [ref=e40]
            - generic [ref=e41]: Composto
          - generic [ref=e42]:
            - generic [ref=e43]: Pernas
            - generic [ref=e44]: Barra
        - generic [ref=e45]:
          - heading "Cadeira Extensora" [level=3] [ref=e47]
          - generic [ref=e48]:
            - generic [ref=e49]: Pernas
            - generic [ref=e50]: Máquina Peso
        - generic [ref=e51]:
          - heading "Crucifixo" [level=3] [ref=e53]
          - generic [ref=e54]:
            - generic [ref=e55]: Peito
            - generic [ref=e56]: Halter
        - generic [ref=e57]:
          - generic [ref=e58]:
            - heading "Desenvolvimento" [level=3] [ref=e59]
            - generic [ref=e60]: Composto
          - generic [ref=e61]:
            - generic [ref=e62]: Ombros
            - generic [ref=e63]: Halter
        - generic [ref=e64]:
          - heading "Elevação Lateral" [level=3] [ref=e66]
          - generic [ref=e67]:
            - generic [ref=e68]: Ombros
            - generic [ref=e69]: Halter
        - generic [ref=e70]:
          - generic [ref=e71]:
            - heading "Leg Press" [level=3] [ref=e72]
            - generic [ref=e73]: Composto
          - generic [ref=e74]:
            - generic [ref=e75]: Pernas
            - generic [ref=e76]: Máquina Peso
        - generic [ref=e77]:
          - generic [ref=e78]:
            - heading "Levantamento Terra" [level=3] [ref=e79]
            - generic [ref=e80]: Composto
          - generic [ref=e81]:
            - generic [ref=e82]: Costas
            - generic [ref=e83]: Barra
        - generic [ref=e84]:
          - generic [ref=e85]:
            - heading "Puxada Frontal" [level=3] [ref=e86]
            - generic [ref=e87]: Composto
          - generic [ref=e88]:
            - generic [ref=e89]: Costas
            - generic [ref=e90]: Cabo/Polia
        - generic [ref=e91]:
          - generic [ref=e92]:
            - heading "Remada Curvada" [level=3] [ref=e93]
            - generic [ref=e94]: Composto
          - generic [ref=e95]:
            - generic [ref=e96]: Costas
            - generic [ref=e97]: Barra
        - generic [ref=e98]:
          - heading "Rosca Direta" [level=3] [ref=e100]
          - generic [ref=e101]:
            - generic [ref=e102]: Braços
            - generic [ref=e103]: Barra
        - generic [ref=e104]:
          - generic [ref=e105]:
            - heading "Supino Inclinado Halteres" [level=3] [ref=e106]
            - generic [ref=e107]: Composto
          - generic [ref=e108]:
            - generic [ref=e109]: Peito
            - generic [ref=e110]: Halter
        - generic [ref=e111]:
          - generic [ref=e112]:
            - heading "Supino Reto" [level=3] [ref=e113]
            - generic [ref=e114]: Composto
          - generic [ref=e115]:
            - generic [ref=e116]: Peito
            - generic [ref=e117]: Barra
        - generic [ref=e118]:
          - heading "Tríceps Pulley" [level=3] [ref=e120]
          - generic [ref=e121]:
            - generic [ref=e122]: Braços
            - generic [ref=e123]: Cabo/Polia
        - generic [ref=e124]:
          - heading "Tríceps Testa" [level=3] [ref=e126]
          - generic [ref=e127]:
            - generic [ref=e128]: Braços
            - generic [ref=e129]: Halter
  - button "Open Next.js Dev Tools" [ref=e135] [cursor=pointer]:
    - img [ref=e136]
  - alert [ref=e139]
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
> 28 |     await expect(equipmentFilter).toBeVisible();
     |                                   ^ Error: expect(locator).toBeVisible() failed
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