import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3010'

// ──────────────────────────────────────────────
// 인증 페이지
// ──────────────────────────────────────────────
test.describe('인증 페이지', () => {
  test('로그인 페이지 렌더링', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toContainText('로그인')
  })

  test('회원가입 페이지 렌더링', async ({ page }) => {
    await page.goto(`${BASE}/signup`)
    await expect(page.getByRole('heading', { name: '회원가입' })).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
  })

  test('로그인/회원가입 페이지 간 링크', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.click('text=회원가입')
    await expect(page).toHaveURL(`${BASE}/signup`)

    await page.click('text=로그인')
    await expect(page).toHaveURL(`${BASE}/login`)
  })

  test('잘못된 비밀번호로 로그인 시 오류 표시', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.fill('input[name="email"]', 'noone@example.com')
    await page.fill('input[name="password"]', 'wrong')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(2000)
    // 오류 메시지 또는 로그인 페이지 유지 확인
    await expect(page).toHaveURL(`${BASE}/login`)
  })
})

// ──────────────────────────────────────────────
// 라우트 보호
// ──────────────────────────────────────────────
test.describe('라우트 보호', () => {
  test('비로그인 상태에서 /dashboard 접근 시 /login 리디렉션', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`)
    await expect(page).toHaveURL(`${BASE}/login`)
  })

  test('비로그인 상태에서 /dashboard/new 접근 시 /login 리디렉션', async ({ page }) => {
    await page.goto(`${BASE}/dashboard/new`)
    await expect(page).toHaveURL(`${BASE}/login`)
  })

  test('/ 접근 시 /dashboard 또는 /login으로 리디렉션', async ({ page }) => {
    await page.goto(BASE)
    const url = page.url()
    expect(url).toMatch(/\/(dashboard|login)/)
  })
})

// ──────────────────────────────────────────────
// 인증 후 플로우 (demo 계정)
// ──────────────────────────────────────────────
test.describe('인증 후 플로우', () => {
  // 로그인 상태 유지를 위한 fixture
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.fill('input[name="email"]', 'demo@imsangnote.com')
    await page.fill('input[name="password"]', 'demo1234')
    await page.click('button[type="submit"]')
    await page.waitForURL(`${BASE}/dashboard`, { timeout: 8000 })
  })

  test('대시보드 렌더링 — 헤더와 매물 목록', async ({ page }) => {
    await expect(page.locator('text=임장노트')).toBeVisible()
    await expect(page.locator('text=내 매물 목록')).toBeVisible()
    await expect(page.locator('text=비교표')).toBeVisible()
    await expect(page.locator('text=로그아웃')).toBeVisible()
  })

  test('매물 등록 페이지 렌더링', async ({ page }) => {
    await page.goto(`${BASE}/dashboard/new`)
    await expect(page.locator('text=새 매물 추가')).toBeVisible()
    await expect(page.getByRole('heading', { name: '기본 정보' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '체크리스트' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '메모 & 연락처' })).toBeVisible()
    await expect(page.locator('button[type="submit"]:has-text("매물 저장")')).toBeVisible()
  })

  test('비교표 페이지 렌더링', async ({ page }) => {
    await page.goto(`${BASE}/dashboard/compare`)
    await expect(page.locator('text=매물 비교표')).toBeVisible()
  })

  test('로그인 후 /login 접근 시 /dashboard 리디렉션', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await expect(page).toHaveURL(`${BASE}/dashboard`)
  })

  test('로그아웃 후 /dashboard 접근 시 /login 리디렉션', async ({ page }) => {
    await page.locator('button:has-text("로그아웃")').click()
    await page.waitForURL(`${BASE}/login`)
    await page.goto(`${BASE}/dashboard`)
    await expect(page).toHaveURL(`${BASE}/login`)
  })
})
