import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  UnorderedListOutlined,
  SettingOutlined,
  TeamOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import React from 'react';

export type MenuItem = Required<MenuProps>['items'][number];

// 创建图标映射函数
export const createIconMap = () => ({
  dashboard: DashboardOutlined,
  list: UnorderedListOutlined,
  settings: SettingOutlined,
  employees: TeamOutlined,
  roles: SafetyOutlined,
});

// 菜单数据结构
export const menuData = [
  {
    key: '/',
    iconKey: 'dashboard',
    label: '首页',
  },
  {
    key: '/list',
    iconKey: 'list',
    label: '列表页',
  },
  {
    key: 'settings',
    iconKey: 'settings',
    label: '基础设置',
    children: [
      {
        key: '/employees',
        iconKey: 'employees',
        label: '员工管理',
      },
      {
        key: '/roles',
        iconKey: 'roles',
        label: '角色管理',
      },
    ],
  },
];

// 获取菜单项（带图标）
export const getMenuItems = (): MenuItem[] => {
  const iconMap = createIconMap();

  const processItem = (item: any): any => {
    const { iconKey, ...rest } = item;
    const IconComponent = iconMap[iconKey as keyof typeof iconMap];

    return {
      ...rest,
      ...(IconComponent ? { icon: React.createElement(IconComponent) } : {}),
      ...(item.children ? { children: item.children.map(processItem) } : {}),
    };
  };

  return menuData.map(processItem);
};
