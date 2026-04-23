import { test, expect } from "@playwright/test";

test("kayit ve giris sayfalari aciliyor", async ({ page }) => {
  await page.goto("/kayit");
  await expect(page).toHaveURL(/\/kayit/);

  await page.goto("/giris");
  await expect(page).toHaveURL(/\/giris/);

  await page.goto("/sifremi-unuttum");
  await expect(page).toHaveURL(/\/sifremi-unuttum/);
});
