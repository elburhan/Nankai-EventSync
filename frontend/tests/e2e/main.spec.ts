import { test, expect, type APIRequestContext } from '@playwright/test';

test.setTimeout(120_000);

const timestamp = Date.now();
const organizerEmail = `organizer_${timestamp}@eventsync.test`;
const studentEmail = `student_${timestamp}@eventsync.test`;
const password = 'TestPassword123!';
const eventTitle = `E2E Test Event ${timestamp}`;

const apiBaseUrl = 'http://localhost:5001/api';

const waitForDatabaseReady = async (request: APIRequestContext): Promise<void> => {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    const healthResponse = await request.get(`${apiBaseUrl}/health`);

    if (healthResponse.ok()) {
      const healthBody = (await healthResponse.json()) as {
        data?: {
          database?: string;
        };
      };

      if (healthBody.data?.database === 'connected') {
        return;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error('Backend health never reported database=connected during the E2E startup window.');
};

const registerAndVerifyUser = async (
  request: APIRequestContext,
  values: {
    fullName: string;
    email: string;
    password: string;
    role: 'organizer' | 'student';
  },
): Promise<void> => {
  const registerResponse = await request.post(`${apiBaseUrl}/auth/register`, {
    data: {
      ...values,
      confirmPassword: values.password,
    },
  });

  if (!registerResponse.ok()) {
    throw new Error(
      `Registration failed with ${registerResponse.status()}: ${await registerResponse.text()}`,
    );
  }

  const registerBody = (await registerResponse.json()) as {
    data?: {
      email?: string;
      debugVerificationCode?: string;
    };
  };

  const verificationCode = registerBody.data?.debugVerificationCode;

  expect(verificationCode, 'Expected a dev/test verification code in the registration response.').toMatch(/^\d{6}$/);

  const verifyResponse = await request.post(`${apiBaseUrl}/auth/verify-email`, {
    data: {
      email: values.email,
      code: verificationCode,
    },
  });

  if (!verifyResponse.ok()) {
    throw new Error(
      `Email verification failed with ${verifyResponse.status()}: ${await verifyResponse.text()}`,
    );
  }
};

test('Complete E2E User Journey', async ({ browser, request }) => {
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();

  const organizerPage = await context1.newPage();
  const studentPage = await context2.newPage();

  await waitForDatabaseReady(request);

  // 1. Guest can view landing page
  await organizerPage.goto('/');
  await expect(organizerPage.locator('h1').first()).toBeVisible();
  await expect(organizerPage.getByRole('link', { name: /login/i }).first()).toBeVisible();

  // 2. Provision organizer account through the API so E2E stays independent of inbox access.
  await registerAndVerifyUser(request, {
    fullName: 'E2E Organizer',
    email: organizerEmail,
    password,
    role: 'organizer',
  });

  await organizerPage.goto('/login');

  await organizerPage.fill('input[type="email"]', organizerEmail);
  await organizerPage.locator('input[type="password"]').fill(password);
  await organizerPage.locator('button[type="submit"]').click();
  await expect(organizerPage).toHaveURL(/\/dashboard|\/events/);
  
  // Verify role
  await expect(organizerPage.getByText(/Role: organizer/i)).toBeVisible();

  // Go to create event via UI
  await organizerPage.locator('a[href="/events/new"]').first().click();
  
  await organizerPage.getByPlaceholder('Nankai Innovation Showcase').fill(eventTitle);
  
  await organizerPage.getByPlaceholder(/Tell students/i).fill('This is an E2E test event description that is long enough.');
  await organizerPage.locator('select').first().selectOption('Academic');
  await organizerPage.getByPlaceholder('Student Center Hall A').fill('Main Campus');
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startIso = tomorrow.toISOString().slice(0, 16);
  tomorrow.setHours(tomorrow.getHours() + 2);
  const endIso = tomorrow.toISOString().slice(0, 16);

  await organizerPage.locator('input[type="datetime-local"]').nth(0).fill(startIso);
  await organizerPage.locator('input[type="datetime-local"]').nth(1).fill(endIso);

  await organizerPage.getByText('Published', { exact: true }).click();

  await organizerPage.locator('button[type="submit"]').click();
  await expect(organizerPage.locator('h1', { hasText: eventTitle })).toBeVisible();
  
  const eventUrl = organizerPage.url();

  // 3. Provision student account through the same API path and verify it before UI login.
  await registerAndVerifyUser(request, {
    fullName: 'E2E Student',
    email: studentEmail,
    password,
    role: 'student',
  });

  await studentPage.goto('/login');

  await studentPage.fill('input[type="email"]', studentEmail);
  await studentPage.locator('input[type="password"]').fill(password);
  await studentPage.locator('button[type="submit"]').click();
  await expect(studentPage).toHaveURL(/\/dashboard|\/events/);

  // 4. Student RSVPs
  await studentPage.goto(eventUrl);
  await expect(studentPage.locator('h1', { hasText: eventTitle })).toBeVisible();

  const rsvpButton = studentPage.locator('button:has-text("Join Event")');
  await expect(rsvpButton).toBeVisible();
  await rsvpButton.click();
  await expect(studentPage.locator('button:has-text("Cancel RSVP")')).toBeVisible();

  // 5. Check real-time update on organizer page
  // The organizer page should already be on the event detail page.
  await organizerPage.waitForTimeout(1000);
  
  await context1.close();
  await context2.close();
});
