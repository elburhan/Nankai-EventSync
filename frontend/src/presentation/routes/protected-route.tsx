import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { LoadingState } from '../components/loading-state';
import { APP_ROUTES } from '../../shared/constants/app-route';
import { useAuth } from '../../shared/hooks/use-auth';

export const ProtectedRoute = () => {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return <LoadingState title="Restoring session" message="Checking your EventSync access." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={APP_ROUTES.LOGIN} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};
