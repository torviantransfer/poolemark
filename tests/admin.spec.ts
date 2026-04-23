import { test, expect } from "@playwright/test";

test("admin giris ve urunler sayfasi", async ({ page }) => {
  await page.goto("/giris?redirect=/admin");
  await expect(page).toHaveURL(/\/giris/);

  await page.goto("/admin/urunler");
  await expect(page).toHaveURL(/\/admin\/urunler/);
});
