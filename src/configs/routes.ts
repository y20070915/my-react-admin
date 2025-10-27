// 路由配置信息
export const routes = {
  home: '/',
  login: '/login',
  list: '/list',
  listCreate: '/list/create',
  listEdit: (id: string) => `/list/edit/${id}`,

  employees: '/employees',
  employeesCreate: '/employees/create',
  employeesEdit: (id: string) => `/employees/edit/${id}`,

  roles: '/roles',
  rolesCreate: '/roles/create',
  rolesEdit: (id: string) => `/roles/edit/${id}`,

  notFound: '/404',
};

// 验证路由是否有效
export const isValidRoute = (path: string): boolean => {
  // 主页和登录页
  if (path === routes.home || path === routes.login || path === routes.notFound) return true;

  // 列表页相关
  if (path === routes.list || path === routes.listCreate) return true;
  if (/^\/list\/edit\/[^/]+$/.test(path)) return true;

  // 员工管理相关
  if (path === routes.employees || path === routes.employeesCreate) return true;
  if (/^\/employees\/edit\/[^/]+$/.test(path)) return true;

  // 角色管理相关
  if (path === routes.roles || path === routes.rolesCreate) return true;
  if (/^\/roles\/edit\/[^/]+$/.test(path)) return true;

  return false;
};
