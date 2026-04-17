# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> Dashboard Page >> should display navigation links
- Location: e2e\dashboard.spec.ts:9:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('link', { name: /Dashboard/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('link', { name: /Dashboard/i })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e9] [cursor=pointer]:
    - generic [ref=e12]:
      - text: Rendering
      - generic [ref=e13]:
        - generic [ref=e14]: .
        - generic [ref=e15]: .
        - generic [ref=e16]: .
  - alert [ref=e17]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Dashboard Page", () => {
  4  |   test("should load dashboard with correct title", async ({ page }) => {
  5  |     await page.goto("/");
  6  |     await expect(page).toHaveTitle(/Iron Brain/);
  7  |   });
  8  | 
  9  |   test("should display navigation links", async ({ page }) => {
  10 |     await page.goto("/");
> 11 |     await expect(page.getByRole("link", { name: /Dashboard/i })).toBeVisible();
     |                                                                  ^ Error: expect(locator).toBeVisible() failed
  12 |     await expect(page.getByRole("link", { name: /Exercícios/i })).toBeVisible();
  13 |     await expect(page.getByRole("link", { name: /Treinos/i })).toBeVisible();
  14 |     await expect(page.getByRole("link", { name: /Progresso/i })).toBeVisible();
  15 |   });
  16 | 
  17 |   test("should display Iron Brain logo", async ({ page }) => {
  18 |     await page.goto("/");
  19 |     await expect(page.getByText("IRON BRAIN")).toBeVisible();
  20 |   });
  21 | 
  22 |   test("should navigate to exercises page", async ({ page }) => {
  23 |     await page.goto("/");
  24 |     await page.getByRole("link", { name: /Exercícios/i }).click();
  25 |     await expect(page).toHaveURL(/\/exercises/);
  26 |   });
  27 | 
  28 |   test("should navigate to workouts page", async ({ page }) => {
  29 |     await page.goto("/");
  30 |     await page.getByRole("link", { name: /Treinos/i }).click();
  31 |     await expect(page).toHaveURL(/\/workouts/);
  32 |   });
  33 | 
  34 |   test("should navigate to progress page", async ({ page }) => {
  35 |     await page.goto("/");
  36 |     await page.getByRole("link", { name: /Progresso/i }).click();
  37 |     await expect(page).toHaveURL(/\/progress/);
  38 |   });
  39 | });
  40 | 
```