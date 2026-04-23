import { test, expect } from "@playwright/test";

test("kritik checkout akisi", async ({ page }) => {
  await page.goto("/");

  await page.locator('a[href^="/products/"]').first().click();
  await expect(page).toHaveURL(/\/products\//);

  const addToCartButton = page.getByRole("button", { name: /sepete/i }).first();
  await addToCartButton.click();

  await page.goto("/sepet");
  await expect(page.getByRole("heading", { name: /sepetim/i })).toBeVisible();

  await page.goto("/checkout");
  await expect(page.getByRole("heading", { name: /ödeme|checkout/i })).toBeVisible();
});
