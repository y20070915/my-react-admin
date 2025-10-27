import { Outlet, useLocation, Navigate } from '@modern-js/runtime/router';
import AdminLayout from '@/layouts/AdminLayout';
import { ErrorBoundary } from '@/components';
import { auth } from '@/utils/auth';

export default function Layout() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isAuthenticated = auth.isAuthenticated();

  // 如果访问登录页且已登录，跳转到首页
  if (isLoginPage && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 如果是登录页，不显示AdminLayout
  if (isLoginPage) {
    return (
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    );
  }

  // 所有其他页面都包装AdminLayout
  return (
    <ErrorBoundary>
      <AdminLayout />
    </ErrorBoundary>
  );
}
