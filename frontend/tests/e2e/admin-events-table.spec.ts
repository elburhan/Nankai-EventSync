import { expect, test } from '@playwright/test';

const buildJwt = (payload: Record<string, unknown>): string => {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
  return `header.${encodedPayload}.signature`;
};

test('Admin can moderate event status and delete from the management table', async ({ page }) => {
  let adminEvents = [
    {
      id: 'event-1',
      title: 'Admin Table Event One',
      description: 'A managed event for admin delete testing.',
      category: 'Academic',
      location: 'Main Hall',
      timezone: 'Asia/Shanghai',
      startAt: '2026-06-10T10:00:00.000Z',
      endAt: '2026-06-10T12:00:00.000Z',
      attendeeCount: 0,
      tags: ['ai'],
      status: 'published',
      organizer: {
        id: 'organizer-1',
        fullName: 'Organizer One',
        email: 'organizer1@eventsync.test',
      },
      createdAt: '2026-06-01T10:00:00.000Z',
      updatedAt: '2026-06-01T10:00:00.000Z',
    },
    {
      id: 'event-2',
      title: 'Admin Table Event Two',
      description: 'Another managed event for admin delete testing.',
      category: 'Sports',
      location: 'Gym Court',
      timezone: 'Asia/Shanghai',
      startAt: '2026-06-11T10:00:00.000Z',
      endAt: '2026-06-11T12:00:00.000Z',
      attendeeCount: 0,
      tags: ['fitness'],
      status: 'published',
      organizer: {
        id: 'organizer-2',
        fullName: 'Organizer Two',
        email: 'organizer2@eventsync.test',
      },
      createdAt: '2026-06-01T10:00:00.000Z',
      updatedAt: '2026-06-01T10:00:00.000Z',
    },
  ];

  await page.addInitScript((token) => {
    window.localStorage.setItem('eventsync.auth.token', token);
  }, buildJwt({ sub: 'admin-user', role: 'admin' }));

  await page.route('**/api/calendar-events**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: adminEvents,
      }),
    });
  });

  await page.route('**/api/events**', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.fallback();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: adminEvents,
        pagination: {
          page: 1,
          limit: 50,
          totalItems: adminEvents.length,
          totalPages: 1,
        },
      }),
    });
  });

  await page.route('**/api/events/**', async (route) => {
    const method = route.request().method();
    const requestUrl = route.request().url();

    if (method === 'PATCH' && requestUrl.endsWith('/status')) {
      const eventId = requestUrl.split('/').slice(-2, -1)[0];
      const payload = route.request().postDataJSON() as { status: string };
      adminEvents = adminEvents.map((event) => (
        event.id === eventId
          ? {
              ...event,
              status: payload.status as typeof event.status,
            }
          : event
      ));

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Event status updated successfully.',
          data: adminEvents.find((event) => event.id === eventId),
        }),
      });
      return;
    }

    if (method !== 'DELETE') {
      await route.fallback();
      return;
    }

    const eventId = requestUrl.split('/').pop();
    adminEvents = adminEvents.filter((event) => event.id !== eventId);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Event deleted successfully.',
      }),
    });
  });

  await page.goto('/events');

  await expect(page.getByText('Cross-organiser event management')).toBeVisible();
  await expect(page.getByRole('row', { name: /Admin Table Event One/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel event' }).first()).toBeVisible();

  // Moderation actions should be visible to admins and update the row immediately.
  await page.getByRole('button', { name: 'Cancel event' }).first().click();

  await expect(page.getByRole('row', { name: /Admin Table Event One/i })).toContainText('Cancelled');

  // Delete remains a separate destructive action with confirmation.
  await expect(page.getByRole('button', { name: 'Delete Admin Table Event One' })).toBeVisible();
  await page.getByRole('button', { name: 'Delete Admin Table Event One' }).click();

  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('Delete this event from the system?')).toBeVisible();
  await expect(page.getByText(/from the platform for all users/i)).toBeVisible();

  await page.getByRole('button', { name: 'Delete' }).last().click();

  await expect(page.getByRole('row', { name: /Admin Table Event One/i })).toHaveCount(0);
  await expect(page.getByRole('row', { name: /Admin Table Event Two/i })).toBeVisible();
});
