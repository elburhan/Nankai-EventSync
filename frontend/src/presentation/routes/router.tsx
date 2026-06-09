import { createBrowserRouter } from 'react-router-dom';

import { APP_ROUTES } from '../../shared/constants/app-route';
import { AppLayout } from '../layouts/app-layout';
import { CreateEventPage } from '../pages/create-event-page';
import { DashboardPage } from '../pages/dashboard-page';
import { EmailVerificationPage } from '../pages/email-verification-page';
import { EditEventPage } from '../pages/edit-event-page';
import { EventDetailPage } from '../pages/event-detail-page';
import { EventsPage } from '../pages/events-page';
import { HomePage } from '../pages/home-page';
import { LoginPage } from '../pages/login-page';
import { NotFoundPage } from '../pages/not-found-page';
import { RegisterPage } from '../pages/register-page';
import { OrganizerRoute } from './organizer-route';
import { ProtectedRoute } from './protected-route';

export const router = createBrowserRouter([
  {
    path: APP_ROUTES.HOME,
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: APP_ROUTES.LOGIN,
        element: <LoginPage />,
      },
      {
        path: APP_ROUTES.REGISTER,
        element: <RegisterPage />,
      },
      {
        path: APP_ROUTES.VERIFY_EMAIL,
        element: <EmailVerificationPage />,
      },
      {
        path: APP_ROUTES.EVENT_DETAIL,
        element: <EventDetailPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: APP_ROUTES.DASHBOARD,
            element: <DashboardPage />,
          },
          {
            path: APP_ROUTES.EVENTS,
            element: <EventsPage />,
          },
          {
            element: <OrganizerRoute />,
            children: [
              {
                path: APP_ROUTES.CREATE_EVENT,
                element: <CreateEventPage />,
              },
              {
                path: APP_ROUTES.EDIT_EVENT,
                element: <EditEventPage />,
              },
            ],
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
