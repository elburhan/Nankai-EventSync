import { RouterProvider } from 'react-router-dom';

import { AuthProvider } from '../business/services/auth-context';
import { NotificationProvider } from '../business/services/notification-context';
import { ToastViewport } from '../presentation/components/toast-viewport';
import { router } from '../presentation/routes/router';

export const Providers = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <RouterProvider router={router} />
        <ToastViewport />
      </NotificationProvider>
    </AuthProvider>
  );
};
