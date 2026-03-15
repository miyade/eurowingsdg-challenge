import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

test.setTimeout(30000)

async function fillAllFilters(page: Page, origin: string, destination: string, departure = '2026-04-06', ret = '2026-04-10') {
  // Set origin and destination via typing
  await page.locator('#filter-origin').click()
  await page.locator('#filter-origin').pressSequentially(origin, { delay: 80 })
  await expect(page.locator('#filter-origin')).toHaveValue(origin, { timeout: 5000 })
  await page.locator('#filter-destination').click()
  await page.locator('#filter-destination').pressSequentially(destination, { delay: 80 })
  await expect(page.locator('#filter-destination')).toHaveValue(destination, { timeout: 5000 })

  // Set dates via URL — more reliable than interacting with v-calendar
  const currentUrl = page.url()
  const url = new URL(currentUrl)
  url.searchParams.set('origin', origin)
  url.searchParams.set('destination', destination)
  url.searchParams.set('departure', departure)
  url.searchParams.set('return', ret)
  await page.goto(url.toString())
  await page.waitForLoadState('networkidle')

  await expect(page.getByText('flight(s) found')).toBeVisible({ timeout: 15000 })
}

test('shows pre-search state on load', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await expect(page.getByText('Where would you like to go?')).toBeVisible()
  await expect(page.locator('.flight-card')).toHaveCount(0)
})

test('shows flights after entering origin, destination, and dates', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await fillAllFilters(page, 'DUS', 'BCN')
  await expect(page.locator('.flight-card').first()).toBeVisible()
})

test('autocomplete suggests matching origins', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.locator('#filter-origin').focus()
  await page.keyboard.type('DU')
  await expect(page.locator('#origin-suggestions')).toBeVisible({ timeout: 10000 })
  await expect(page.locator('#origin-suggestions')).toContainText('DUS')
})

test('selecting autocomplete suggestion fills the input', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.locator('#filter-origin').focus()
  await page.keyboard.type('DU')
  await expect(page.locator('#origin-suggestions')).toBeVisible({ timeout: 10000 })
  await page.locator('#origin-suggestions').getByText('DUS', { exact: false }).first().click()
  await expect(page.locator('#filter-origin')).toHaveValue('DUS')
})

test('low seats chip filters flights correctly', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await fillAllFilters(page, 'DUS', 'BCN')
  await expect(page.getByRole('button', { name: 'Low seats' })).toBeVisible({ timeout: 5000 })
  await page.getByRole('button', { name: 'Low seats' }).click()
  await expect(page.locator('.flight-card').first()).toBeVisible({ timeout: 5000 })
  await expect(page.getByText(/Only.*seats left/).first()).toBeVisible({ timeout: 5000 })
})

test('sort by price ascending orders flights correctly', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await fillAllFilters(page, 'DUS', 'BCN')
  await page.locator('#sort-select').selectOption('price-asc')
  const priceElements = page.locator('.flight-price__amount')
  const count = await priceElements.count()
  expect(count).toBeGreaterThan(0)
  const prices: number[] = []
  for (let i = 0; i < count; i++) {
    const text = await priceElements.nth(i).textContent()
    const numeric = parseFloat((text ?? '').replace(/[^\d,]/g, '').replace(',', '.'))
    prices.push(numeric)
  }
  for (let i = 1; i < prices.length; i++) {
    expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]!)
  }
})

test('price popover opens and closes', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await fillAllFilters(page, 'DUS', 'BCN')
  await page.getByRole('button', { name: /Price/ }).click()
  await expect(page.getByRole('dialog', { name: 'Set maximum price' })).toBeVisible()
  await page.mouse.click(10, 10)
  await expect(page.getByRole('dialog', { name: 'Set maximum price' })).not.toBeVisible()
})
