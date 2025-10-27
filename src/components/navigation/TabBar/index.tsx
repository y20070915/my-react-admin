/**
 * Tab标签栏组件
 * 提供页面标签的显示和操作功能
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  Modal,
  Input
} from 'antd';
import {
  CloseOutlined,
  SettingOutlined,
  LeftOutlined,
  RightOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { TabItem } from '@/hooks/useTabs';
import Sticky from '../../layout/Sticky';
import './TabBar.css';

interface TabBarProps {
  tabs: TabItem[];
  activeKey: string;
  onTabChange: (key: string) => void;
  onTabClose: (key: string) => void;
  onCloseOther: (key: string) => void;
  onCloseAll: () => void;
  onCloseLeft: (key: string) => void;
  onCloseRight: (key: string) => void;
  onTabRename?: (key: string, newTitle: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeKey,
  onTabChange,
  onTabClose,
  onCloseOther,
  onCloseAll,
  onCloseLeft,
  onCloseRight,
  onTabRename,
  className,
  style
}) => {
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    tabKey: string;
  }>({ visible: false, x: 0, y: 0, tabKey: '' });

  const contextMenuRef = useRef<HTMLDivElement>(null);

  const [renameModal, setRenameModal] = useState<{
    visible: boolean;
    tabKey: string;
    title: string;
  }>({ visible: false, tabKey: '', title: '' });

  const tabBarRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 处理标签点击
  const handleTabClick = (key: string) => {
    onTabChange(key);
  };

  // 处理标签关闭
  const handleTabClose = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    onTabClose(key);
  };


  // 处理右键菜单
  const handleContextMenu = (e: React.MouseEvent, key: string) => {
    e.preventDefault();
    e.stopPropagation();

    const tab = tabs.find(t => t.key === key);
    if (!tab) return;

    // 计算菜单位置，确保不超出视窗
    const x = Math.min(e.clientX, window.innerWidth - 200);
    const y = Math.min(e.clientY, window.innerHeight - 300);

    setContextMenu({
      visible: true,
      x,
      y,
      tabKey: key
    });
  };

  // 关闭右键菜单
  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0, tabKey: '' });
  };

  // 处理标签重命名
  const handleRename = (key: string) => {
    const tab = tabs.find(t => t.key === key);
    if (tab) {
      setRenameModal({
        visible: true,
        tabKey: key,
        title: tab.title
      });
    }
    closeContextMenu();
  };

  // 确认重命名
  const confirmRename = () => {
    if (onTabRename && renameModal.title.trim()) {
      onTabRename(renameModal.tabKey, renameModal.title.trim());
    }
    setRenameModal({ visible: false, tabKey: '', title: '' });
  };

  // 处理右键菜单项点击
  const handleContextMenuAction = (action: string, key: string) => {
    switch (action) {
      case 'rename':
        handleRename(key);
        break;
      case 'close-others':
        onCloseOther(key);
        closeContextMenu();
        break;
      case 'close-left':
        onCloseLeft(key);
        closeContextMenu();
        break;
      case 'close-right':
        onCloseRight(key);
        closeContextMenu();
        break;
      case 'close':
        onTabClose(key);
        closeContextMenu();
        break;
      default:
        break;
    }
  };

  // 渲染标签内容
  const renderTabContent = (tab: TabItem) => {
    return (
      <div
        className={`tab-item ${activeKey === tab.key ? 'active' : ''}`}
        onContextMenu={(e) => handleContextMenu(e, tab.key)}
      >
        <div className="tab-content" onClick={() => handleTabClick(tab.key)}>
          <span className="tab-title" title={tab.title}>
            {tab.title}
          </span>
        </div>

        <div className="tab-actions">
          {tab.closable && (
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={(e) => handleTabClose(e, tab.key)}
              className="tab-action-btn"
            />
          )}
        </div>
      </div>
    );
  };

  // 渲染标签列表
  const tabItems = tabs.map(tab => ({
    key: tab.key,
    label: renderTabContent(tab),
    closable: tab.closable
  }));

  // 监听点击事件，关闭右键菜单
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };

    if (contextMenu.visible) {
      document.addEventListener('click', handleClick);
      return () => {
        document.removeEventListener('click', handleClick);
      };
    }
  }, [contextMenu.visible]);

  return (
    <Sticky
      className={className}
      style={style}
      threshold={80}
      hideThreshold={50}
    >
      <div
        className="tab-bar"
        ref={tabBarRef}
      >
      <div className="tab-scroll-container" ref={scrollRef}>
        <div className="tab-list">
          {tabs.map(tab => (
            <div key={tab.key} className="tab-wrapper">
              {renderTabContent(tab)}
            </div>
          ))}
        </div>
      </div>

      {/* 右键菜单 */}
      {contextMenu.visible && (() => {
        const currentTab = tabs.find(t => t.key === contextMenu.tabKey);
        if (!currentTab) return null;

        return (
          <div
            ref={contextMenuRef}
            className="tab-context-menu"
            style={{
              position: 'fixed',
              left: contextMenu.x,
              top: contextMenu.y,
              zIndex: 1000,
              background: '#fff',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
              minWidth: '120px',
              padding: '4px 0'
            }}
          >
            <div
              className="context-menu-item"
              onClick={() => handleContextMenuAction('rename', contextMenu.tabKey)}
            >
              <SettingOutlined style={{ marginRight: 8 }} />
              重命名
            </div>
            <div className="context-menu-divider" />
            <div
              className="context-menu-item"
              onClick={() => handleContextMenuAction('close-others', contextMenu.tabKey)}
            >
              <CloseCircleOutlined style={{ marginRight: 8 }} />
              关闭其他
            </div>
            <div
              className="context-menu-item"
              onClick={() => handleContextMenuAction('close-left', contextMenu.tabKey)}
            >
              <LeftOutlined style={{ marginRight: 8 }} />
              关闭左侧
            </div>
            <div
              className="context-menu-item"
              onClick={() => handleContextMenuAction('close-right', contextMenu.tabKey)}
            >
              <RightOutlined style={{ marginRight: 8 }} />
              关闭右侧
            </div>
            {currentTab.closable && (
              <>
                <div className="context-menu-divider" />
                <div
                  className="context-menu-item context-menu-item-danger"
                  onClick={() => handleContextMenuAction('close', contextMenu.tabKey)}
                >
                  <CloseOutlined style={{ marginRight: 8 }} />
                  关闭
                </div>
              </>
            )}
          </div>
        );
      })()}

      {/* 重命名模态框 */}
      <Modal
        title="重命名标签"
        open={renameModal.visible}
        onOk={confirmRename}
        onCancel={() => setRenameModal({ visible: false, tabKey: '', title: '' })}
        okText="确定"
        cancelText="取消"
      >
        <Input
          value={renameModal.title}
          onChange={(e) => setRenameModal(prev => ({ ...prev, title: e.target.value }))}
          placeholder="请输入新标题"
          onPressEnter={confirmRename}
          autoFocus
        />
      </Modal>
      </div>
    </Sticky>
  );
};

export default TabBar;
