import { test, expect } from '@playwright/test'

test.setTimeout(15000)

test('shows pre-search state on load', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await expect(page.getByText('Where would you like to go?')).toBeVisible()
  await expect(page.locator('.flight-card')).toHaveCount(0)
})

test('shows flights after entering origin and destination', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.locator('#filter-origin').focus()
  await page.keyboard.type('DUS')
  await page.locator('#filter-destination').focus()
  await page.keyboard.type('BCN')
  await page.waitForTimeout(300)
  await expect(page.locator('.flight-card').first()).toBeVisible({ timeout: 10000 })
  await expect(page.getByText('flight(s) found')).toBeVisible()
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
  await page.locator('#filter-origin').focus()
  await page.keyboard.type('HAM')
  await page.locator('#filter-destination').focus()
  await page.keyboard.type('FCO')
  await page.waitForTimeout(300)
  await expect(page.locator('.flight-card').first()).toBeVisible({ timeout: 10000 })
  await page.getByRole('button', { name: 'Low seats' }).click()
  await expect(page.locator('.flight-card').first()).toBeVisible()
  await expect(page.getByText(/Only.*seats left/)).toBeVisible()
})

test('sort by price ascending orders flights correctly', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.locator('#filter-origin').focus()
  await page.keyboard.type('DUS')
  await page.locator('#filter-destination').focus()
  await page.keyboard.type('BCN')
  await page.waitForTimeout(300)
  await expect(page.locator('.flight-card').first()).toBeVisible({ timeout: 10000 })
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
  await page.locator('#filter-origin').focus()
  await page.keyboard.type('DUS')
  await page.locator('#filter-destination').focus()
  await page.keyboard.type('BCN')
  await page.waitForTimeout(300)
  await expect(page.locator('.flight-card').first()).toBeVisible({ timeout: 10000 })
  await page.getByRole('button', { name: /Price/ }).click()
  await expect(page.getByRole('dialog', { name: 'Set maximum price' })).toBeVisible()
  await page.mouse.click(10, 10)
  await expect(page.getByRole('dialog', { name: 'Set maximum price' })).not.toBeVisible()
})
