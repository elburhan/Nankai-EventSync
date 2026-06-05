import { Navigate, Outlet } from 'react-router-dom';

import { APP_ROUTES } from '../../shared/constants/app-route';
import { useAuth } from '../../shared/hooks/use-auth';

export const OrganizerRoute = () => {
  const { user } = useAuth();

  if (user?.role !== 'organizer') {
    return <Navigate to={APP_ROUTES.EVENTS} replace />;
  }

  return <Outlet />;
};
