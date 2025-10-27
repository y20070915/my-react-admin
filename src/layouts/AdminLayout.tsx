import { useState, Suspense } from 'react';
import { Outlet, useNavigate, useLocation } from '@modern-js/runtime/router';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Space,
  type MenuProps,
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { auth } from '@/utils/auth';
import { getMenuItems } from '@/configs/menu';
import { SuspenseFallback } from '@/components';
import { TabBar } from '@/components';
import { useTabs } from '@/hooks/useTabs';
import { useTabShortcuts } from '@/hooks/useTabShortcuts';
import './AdminLayout.css';

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = auth.getUserInfo();

  // Tab标签管理
  const {
    tabs,
    activeKey,
    addTab,
    removeTab,
    setActiveKey,
    closeOtherTabs,
    closeAllTabs,
    closeLeftTabs,
    closeRightTabs,
    getTabByPath
  } = useTabs();

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = () => {
    auth.logout();
  };

  // Tab标签操作处理
  const handleTabChange = (key: string) => {
    setActiveKey(key);
  };

  const handleTabClose = (key: string) => {
    removeTab(key);
  };


  const handleCloseOther = (key: string) => {
    closeOtherTabs(key);
  };

  const handleCloseAll = () => {
    closeAllTabs();
  };

  const handleCloseLeft = (key: string) => {
    closeLeftTabs(key);
  };

  const handleCloseRight = (key: string) => {
    closeRightTabs(key);
  };


  const handleTabRename = (key: string, newTitle: string) => {
    // 这里可以实现标签重命名逻辑
    console.log('Rename tab:', key, newTitle);
  };

  // 快捷键功能
  useTabShortcuts({
    tabs,
    activeKey,
    onTabChange: handleTabChange,
    onTabClose: handleTabClose,
    onCloseOther: handleCloseOther,
    onCloseAll: handleCloseAll,
    onCloseLeft: handleCloseLeft,
    onCloseRight: handleCloseRight
  });

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <div className="admin-layout">
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo">
          {collapsed ? 'A' : 'Admin'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={getMenuItems()}
          onClick={handleMenuClick}
        />
      </Sider>

      <Layout>
        <Header className="admin-header">
          <div
            className="trigger"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <div className="header-right">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space className="user-info">
                <Avatar icon={<UserOutlined />} />
                <span>{userInfo?.username || 'Admin'}</span>
              </Space>
            </Dropdown>
          </div>
        </Header>

        <Content className="admin-content">
          {/* Tab标签栏 */}
          <TabBar
            tabs={tabs}
            activeKey={activeKey}
            onTabChange={handleTabChange}
            onTabClose={handleTabClose}
            onCloseOther={handleCloseOther}
            onCloseAll={handleCloseAll}
            onCloseLeft={handleCloseLeft}
            onCloseRight={handleCloseRight}
            onTabRename={handleTabRename}
          />

          <Suspense fallback={<SuspenseFallback />}>
            <Outlet />
          </Suspense>
        </Content>
      </Layout>
    </div>
  );
}
