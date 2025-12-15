import { test, expect } from '@playwright/test'

test.describe('Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Clerk authentication
    await page.addInitScript(() => {
      window.localStorage.setItem('clerk-session', JSON.stringify({
        session: {
          id: 'test-session-id',
          user: {
            id: 'test-user-id',
            emailAddresses: [{ emailAddress: 'test@example.com' }],
          },
        },
      }))
    })

    // Mock API responses
    await page.route('**/api/**', async route => {
      const url = route.request().url()
      
      if (url.includes('/api/projects')) {
        await route.fulfill({
          json: [
            {
              id: 'test-project-1',
              name: 'Test Project 1',
              description: 'A test project',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              targets: [
                {
                  id: 'test-target-1',
                  name: 'Test Target',
                  url: 'https://example.com',
                  type: 'web',
                  status: 'active',
                },
              ],
              scans: [
                {
                  id: 'test-scan-1',
                  status: 'completed',
                  severity: 'medium',
                  findings: [],
                },
              ],
            },
          ],
        })
      } else if (url.includes('/api/projects/test-project-1/targets')) {
        await route.fulfill({
          json: [
            {
              id: 'test-target-1',
              projectId: 'test-project-1',
              name: 'Test Target',
              url: 'https://example.com',
              type: 'web',
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })
      } else if (url.includes('/api/projects/test-project-1/scans')) {
        await route.fulfill({
          json: [
            {
              id: 'test-scan-1',
              projectId: 'test-project-1',
              targetId: 'test-target-1',
              status: 'completed',
              severity: 'medium',
              findings: [
                {
                  id: 'finding-1',
                  title: 'SQL Injection Vulnerability',
                  description: 'Potential SQL injection in user input',
                  severity: 'high',
                  type: 'strix',
                  validated: false,
                  createdAt: new Date().toISOString(),
                },
              ],
              startedAt: new Date().toISOString(),
              completedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            },
          ],
        })
      } else {
        await route.continue()
      }
    })
  })

  test('should display dashboard with projects and stats', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Dashboard Overview")')
    
    // Check if dashboard elements are present
    await expect(page.locator('h1')).toContainText('Dashboard Overview')
    await expect(page.locator('text=Total Projects')).toBeVisible()
    await expect(page.locator('text=Active Scans')).toBeVisible()
    await expect(page.locator('text=Critical Findings')).toBeVisible()
    
    // Check if charts are rendered
    await expect(page.locator('[data-testid="pie-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="bar-chart"]')).toBeVisible()
  })

  test('should navigate to projects page and create a project', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Navigate to projects
    await page.click('button:has-text("Projects")')
    await page.waitForURL('/projects')
    
    // Check projects page content
    await expect(page.locator('h1')).toContainText('Projects')
    
    // Open create project dialog
    await page.click('button:has-text("New Project")')
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    
    // Fill form
    await page.fill('input[id="name"]', 'E2E Test Project')
    await page.fill('textarea[id="description"]', 'Project created during E2E test')
    
    // Submit form (mocked)
    await page.click('button:has-text("Create Project")')
    
    // Check for success message (mocked)
    await expect(page.locator('text=Project created successfully')).toBeVisible()
  })

  test('should view project details and manage targets', async ({ page }) => {
    await page.goto('/projects')
    
    // Click on project card
    await page.click('text=Test Project 1')
    await page.waitForURL('/projects/test-project-1')
    
    // Check project detail page
    await expect(page.locator('h1')).toContainText('Project Details')
    
    // Add a new target
    await page.click('button:has-text("Add Target")')
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    
    // Fill target form
    await page.fill('input[id="target-name"]', 'E2E Test Target')
    await page.fill('input[id="target-url"]', 'https://test.example.com')
    await page.selectOption('select[id="target-type"]', 'web')
    
    // Submit form (mocked)
    await page.click('button:has-text("Add Target")')
    
    // Check for success message (mocked)
    await expect(page.locator('text=Target added successfully')).toBeVisible()
  })

  test('should start a scan and view results', async ({ page }) => {
    await page.goto('/projects/test-project-1')
    
    // Start a scan
    await page.click('button:has-text("Scan")')
    
    // Check for scan started message (mocked)
    await expect(page.locator('text=Scan started successfully')).toBeVisible()
    
    // Navigate to scan details (mock URL)
    await page.goto('/scans/test-scan-1')
    
    // Check scan detail page
    await expect(page.locator('h1')).toContainText('Security Scan')
    await expect(page.locator('text=Findings by Severity')).toBeVisible()
    
    // Check findings tab is active by default
    await expect(page.locator('button:has-text("Findings")')).toHaveAttribute('aria-selected', 'true')
  })

  test('should generate and download reports', async ({ page }) => {
    await page.goto('/scans/test-scan-1')
    
    // Switch to reports tab
    await page.click('button:has-text("Reports")')
    
    // Generate PDF report
    await page.click('button:has-text("Generate PDF")')
    
    // Check for report generation message (mocked)
    await expect(page.locator('text=Report generated successfully')).toBeVisible()
    
    // Navigate to reports page
    await page.goto('/reports/test-scan-1')
    
    // Check reports page
    await expect(page.locator('h1')).toContainText('Security Report')
    
    // Try to preview a report
    await page.click('button:has-text("Preview")')
    await expect(page.locator('text=Executive Summary')).toBeVisible()
  })

  test('should handle authentication flow', async ({ page }) => {
    // Clear auth state
    await page.addInitScript(() => {
      window.localStorage.clear()
    })
    
    await page.goto('/dashboard')
    
    // Should redirect to sign-in
    await page.waitForURL('/sign-in')
    await expect(page.locator('h2')).toContainText('Sign in to your account')
    
    // Mock successful sign-in
    await page.addInitScript(() => {
      window.localStorage.setItem('clerk-session', JSON.stringify({
        session: {
          id: 'test-session-id',
          user: {
            id: 'test-user-id',
            emailAddresses: [{ emailAddress: 'test@example.com' }],
          },
        },
      }))
    })
    
    // Reload page
    await page.reload()
    
    // Should now be able to access dashboard
    await page.waitForURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard Overview')
  })
})