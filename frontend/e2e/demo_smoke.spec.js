// @ts-check
import { test, expect } from '@playwright/test'

test.describe('LearnAI Demo Flow E2E Smoke Test', () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

  test('Complete 3-Minute Demo Pitch Flow', async ({ page }) => {
    // 1. Teacher Login
    await page.goto(`${BASE_URL}/login`)
    await expect(page).toHaveTitle(/LearnAI/)

    // Fill teacher credentials
    await page.fill('input[type="text"]', 'T-001')
    await page.fill('input[type="password"]', 'teach123')
    await page.click('button[type="submit"]')

    // 2. Teacher AI Desk
    await page.waitForURL('**/teacher**')
    await page.goto(`${BASE_URL}/teacher/desk`)
    await expect(page.locator('text=Teacher AI Desk')).toBeVisible()

    // 3. Inspect Heatmap
    await page.click('button:has-text("Mastery Heatmap")')
    await expect(page.locator('text=Student Mastery Grid')).toBeVisible()

    // Toggle View as Table alternative
    await page.click('button:has-text("View as Table")')
    await expect(page.locator('text=View as Heatmap')).toBeVisible()

    // 4. Inspect Needs Attention Flags
    await page.click('button:has-text("Needs Attention")')
    await expect(page.locator('text=Needs Attention')).toBeVisible()

    // 5. Check Privacy & Retention Panel in Desk
    await page.click('button:has-text("Privacy & Retention")')
    await expect(page.locator('text=Class Data Privacy & Governance')).toBeVisible()
    await expect(page.locator('text=Data Retention Policy')).toBeVisible()

    // 6. Navigate to standalone Privacy Center
    await page.goto(`${BASE_URL}/privacy`)
    await expect(page.locator('text=Privacy & Ethics Center')).toBeVisible()
    await expect(page.locator('text=What the AI Sees')).toBeVisible()

    // 7. Student Login & Consent Check
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="text"]', 'S-001')
    await page.fill('input[type="password"]', 'student123')
    await page.click('button[type="submit"]')

    await page.waitForURL('**/student**')
    await expect(page.locator('text=Learning Path').or(page.locator('text=Welcome'))).toBeVisible()

    // 8. Open Accessibility Drawer
    await page.click('button:has-text("Accessibility Settings")')
    await expect(page.locator('text=Accessibility & View')).toBeVisible()
    await expect(page.locator('text=Atkinson Hyperlegible')).toBeVisible()
    await page.click('button[aria-label="Close accessibility settings"]')

    // 9. Student Privacy & Export View
    await page.goto(`${BASE_URL}/privacy`)
    await expect(page.locator('text=Download My Data (JSON)')).toBeVisible()
    await expect(page.locator('text=Request Data Deletion')).toBeVisible()
  })
})
