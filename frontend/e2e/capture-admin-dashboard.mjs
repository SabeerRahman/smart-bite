import { chromium } from '@playwright/test'
import path from 'node:path'

const outputDir = process.env.E2E_SCREENSHOT_DIR
if (!outputDir) throw new Error('E2E_SCREENSHOT_DIR is required')

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
try {
  await page.goto('http://localhost:5173/login')
  await page.getByLabel('Email').fill('e2e-admin@smartbite.test')
  await page.getByLabel('Password').fill('SmartBiteE2E!2026')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/dashboard')
  await page.getByText('Administration overview').waitFor()
  await page.screenshot({ path: path.join(outputDir, '11-admin-dashboard-loaded.png'), fullPage: true })
  console.log('Completed admin dashboard screenshot captured.')
} finally {
  await browser.close()
}
