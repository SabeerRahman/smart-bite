import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const runId = Date.now()
const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:5173'
const outputDir = path.resolve(process.cwd(), '..', 'e2e-screenshots', `run-${runId}`)
const donor = { name: `E2E Donor ${runId}`, email: `e2e.donor.${runId}@smartbite.test`, password: 'SmartBiteE2E!2026', phone: '9000000101' }
const ngo = { name: `E2E NGO User ${runId}`, email: `e2e.ngo.${runId}@smartbite.test`, password: 'SmartBiteE2E!2026', phone: '9000000102', ngoName: `E2E Food Rescue ${runId}` }
const admin = { email: 'e2e-admin@smartbite.test', password: 'SmartBiteE2E!2026' }
const foodName = `E2E Vegetable Meal Boxes ${runId}`
const captured = []

await mkdir(outputDir, { recursive: true })
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const shot = async (name) => { const file = path.join(outputDir, name); await page.screenshot({ path: file, fullPage: true }); captured.push(file) }
page.on('dialog', async (dialog) => {
  if (dialog.type() === 'prompt') {
    await dialog.accept(dialog.message().includes('Quantity') ? '12' : 'Tomorrow, 10:00 AM')
  } else {
    await dialog.accept()
  }
})
const logout = async () => { await page.getByRole('button', { name: 'Log out' }).click(); await page.waitForURL('**/login') }
const login = async (account) => { await page.goto(`${baseUrl}/login`); await page.getByLabel('Email').fill(account.email); await page.getByLabel('Password').fill(account.password); await page.getByRole('button', { name: 'Sign in' }).click(); await page.waitForURL('**/dashboard') }

try {
  await page.goto(`${baseUrl}/register`)
  await page.getByLabel('Your name').fill(donor.name)
  await page.getByLabel('Phone').fill(donor.phone)
  await page.getByLabel('Email').fill(donor.email)
  await page.getByLabel('Password (8+ characters)').fill(donor.password)
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.waitForURL('**/dashboard')
  await shot('01-donor-dashboard.png')

  await page.goto(`${baseUrl}/donations/new`)
  await page.getByLabel('Food name').fill(foodName)
  await page.getByLabel('Quantity').fill('24')
  await page.getByLabel('Best before / expiry').fill(new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 16))
  await page.getByLabel('Pickup time').fill('Today, 5:00 PM to 7:00 PM')
  await page.getByLabel('Pickup address').fill('42 Demo Avenue, Bengaluru, Karnataka 560001')
  await page.getByLabel('Description').fill('Freshly prepared vegetarian vegetable meal boxes for the SmartBite browser test.')
  await page.getByRole('button', { name: 'Publish donation' }).click()
  await page.waitForURL('**/donations')
  await page.getByText(foodName).waitFor()
  await shot('02-donor-donation-list.png')
  await logout()

  await page.goto(`${baseUrl}/register`)
  await page.getByLabel('I am a').selectOption('NGO')
  await page.getByLabel('Your name').fill(ngo.name)
  await page.getByLabel('Phone').fill(ngo.phone)
  await page.getByLabel('Email').fill(ngo.email)
  await page.getByLabel('Password (8+ characters)').fill(ngo.password)
  await page.getByLabel('NGO name').fill(ngo.ngoName)
  await page.getByLabel('Contact person').fill(ngo.name)
  await page.getByLabel('Address').fill('18 Community Lane, Bengaluru, Karnataka 560002')
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.waitForURL('**/dashboard')
  await shot('03-ngo-pending-verification.png')
  await logout()

  await login(admin)
  await page.getByRole('link', { name: 'NGO verification' }).click()
  await page.getByText(ngo.ngoName).waitFor()
  await shot('04-admin-ngo-verification.png')
  const ngoCard = page.locator('article', { hasText: ngo.ngoName })
  await ngoCard.getByRole('button', { name: 'Approve' }).click()
  await ngoCard.getByText('VERIFIED').waitFor()
  await shot('05-admin-ngo-verified.png')
  await logout()

  await login(ngo)
  await page.getByRole('link', { name: 'Browse food' }).click()
  await page.getByText(foodName).waitFor()
  await shot('06-ngo-browse-donations.png')
  const foodCard = page.locator('article', { hasText: foodName })
  await foodCard.getByRole('button', { name: 'Request food' }).click()
  await page.getByRole('link', { name: 'My requests' }).click()
  await page.getByText(foodName).waitFor()
  await shot('07-ngo-request-pending.png')
  await logout()

  await login(donor)
  await page.getByRole('link', { name: 'Requests' }).click()
  const donorRequest = page.locator('article', { hasText: foodName })
  await donorRequest.getByRole('button', { name: 'Accept' }).click()
  await donorRequest.getByText('ACCEPTED').waitFor()
  await shot('08-donor-request-accepted.png')
  await logout()

  await login(ngo)
  await page.getByRole('link', { name: 'My requests' }).click()
  const ngoRequest = page.locator('article', { hasText: foodName })
  await ngoRequest.getByRole('button', { name: 'Schedule pickup' }).click()
  await ngoRequest.getByRole('button', { name: 'Confirm collected' }).click()
  await ngoRequest.getByRole('button', { name: 'Confirm distributed' }).click()
  await ngoRequest.getByText('DISTRIBUTED').waitFor()
  await shot('09-ngo-distribution-confirmed.png')
  await logout()

  await login(admin)
  await page.getByText('Administration overview').waitFor()
  await shot('10-admin-dashboard-updated.png')
  await writeFile(path.join(outputDir, 'test-result.json'), JSON.stringify({ status: 'passed', runId, donorEmail: donor.email, ngoEmail: ngo.email, foodName, screenshots: captured.map(file => path.basename(file)) }, null, 2))
  console.log(`E2E workflow passed. Screenshots saved to ${outputDir}`)
} catch (error) {
  await page.screenshot({ path: path.join(outputDir, 'failure-state.png'), fullPage: true }).catch(() => {})
  await writeFile(path.join(outputDir, 'test-result.json'), JSON.stringify({ status: 'failed', error: error.message, screenshots: captured.map(file => path.basename(file)) }, null, 2))
  throw error
} finally {
  await browser.close()
}
