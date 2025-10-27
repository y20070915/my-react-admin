import { useState, useEffect, useRef } from 'react';
import { Menu, Avatar, Divider, Space, Typography, message, Modal } from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  LogoutOutlined,
  SettingOutlined,
  ReloadOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { auth } from '@/utils/auth';
import { useNavigate } from '@modern-js/runtime/router';
import './ContextMenu.css';

const { Text } = Typography;

interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function ContextMenu({ visible, x, y, onClose, onRefresh }: ContextMenuProps) {
  const navigate = useNavigate();
  const userInfo = auth.getUserInfo();
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部区域关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [visible, onClose]);

  const handleLogout = () => {
    Modal.confirm({
      title: '确认退出',
      content: '确定要退出登录吗？',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        auth.logout();
        message.success('已退出登录');
      },
    });
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      message.success('刷新成功');
    }
    onClose();
  };

  const handlePrint = () => {
    window.print();
    message.success('正在打印...');
    onClose();
  };

  const handleNew = () => {
    navigate('/list/create');
    onClose();
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      disabled: true,
      label: (
        <div className="user-info-section">
          <Space size="middle">
            <Avatar icon={<UserOutlined />} size={40} />
            <div className="user-details">
              <Text strong style={{ display: 'block', fontSize: '14px' }}>
                {userInfo?.username || 'Admin'}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                {userInfo?.role || '管理员'}
              </Text>
            </div>
          </Space>
        </div>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'new',
      label: '新建数据',
      icon: <PlusOutlined />,
      onClick: handleNew,
    },
    {
      key: 'refresh',
      label: '刷新列表',
      icon: <ReloadOutlined />,
      onClick: handleRefresh,
    },
    {
      key: 'print',
      label: '打印列表',
      icon: <PrinterOutlined />,
      onClick: handlePrint,
    },
    {
      type: 'divider',
    },
    {
      key: 'settings',
      label: '系统设置',
      icon: <SettingOutlined />,
      onClick: () => {
        message.info('设置功能开发中...');
        onClose();
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <Menu
        mode="vertical"
        items={menuItems}
        style={{ border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
      />
    </div>
  );
}
