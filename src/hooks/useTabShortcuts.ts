/**
 * Tab标签快捷键Hook
 * 提供键盘快捷键操作Tab标签的功能
 */

import { useEffect, useCallback } from 'react';
import { message } from 'antd';

interface UseTabShortcutsProps {
  tabs: any[];
  activeKey: string;
  onTabChange: (key: string) => void;
  onTabClose: (key: string) => void;
  onCloseOther: (key: string) => void;
  onCloseAll: () => void;
  onCloseLeft: (key: string) => void;
  onCloseRight: (key: string) => void;
}

export const useTabShortcuts = ({
  tabs,
  activeKey,
  onTabChange,
  onTabClose,
  onCloseOther,
  onCloseAll,
  onCloseLeft,
  onCloseRight
}: UseTabShortcutsProps) => {

  // 切换到下一个标签
  const switchToNextTab = useCallback(() => {
    const currentIndex = tabs.findIndex(tab => tab.key === activeKey);
    if (currentIndex >= 0 && currentIndex < tabs.length - 1) {
      const nextTab = tabs[currentIndex + 1];
      onTabChange(nextTab.key);
    } else if (tabs.length > 0) {
      // 如果当前是最后一个，切换到第一个
      onTabChange(tabs[0].key);
    }
  }, [tabs, activeKey, onTabChange]);

  // 切换到上一个标签
  const switchToPrevTab = useCallback(() => {
    const currentIndex = tabs.findIndex(tab => tab.key === activeKey);
    if (currentIndex > 0) {
      const prevTab = tabs[currentIndex - 1];
      onTabChange(prevTab.key);
    } else if (tabs.length > 0) {
      // 如果当前是第一个，切换到最后一个
      onTabChange(tabs[tabs.length - 1].key);
    }
  }, [tabs, activeKey, onTabChange]);

  // 关闭当前标签
  const closeCurrentTab = useCallback(() => {
    const currentTab = tabs.find(tab => tab.key === activeKey);
    if (currentTab && currentTab.closable) {
      onTabClose(activeKey);
    } else {
      message.warning('当前标签不可关闭');
    }
  }, [tabs, activeKey, onTabClose]);



  // 键盘事件处理
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // 检查是否按住了Ctrl键（Windows/Linux）或Cmd键（Mac）
    const isCtrlOrCmd = event.ctrlKey || event.metaKey;

    if (!isCtrlOrCmd) return;

    switch (event.key) {
      case 'Tab':
        event.preventDefault();
        if (event.shiftKey) {
          switchToPrevTab();
        } else {
          switchToNextTab();
        }
        break;

      case 'w':
        event.preventDefault();
        closeCurrentTab();
        break;


      case '1':
        event.preventDefault();
        if (tabs.length > 0) {
          onTabChange(tabs[0].key);
        }
        break;

      case '9':
        event.preventDefault();
        if (tabs.length > 0) {
          onTabChange(tabs[tabs.length - 1].key);
        }
        break;

      case 't':
        event.preventDefault();
        // 这里可以添加新建标签的逻辑
        message.info('新建标签功能待实现');
        break;

      case 'n':
        event.preventDefault();
        onCloseOther(activeKey);
        break;

      case 'a':
        event.preventDefault();
        onCloseAll();
        break;

      case 'l':
        event.preventDefault();
        onCloseLeft(activeKey);
        break;

      case 'r':
        if (event.shiftKey) {
          event.preventDefault();
          onCloseRight(activeKey);
        }
        break;

      default:
        break;
    }
  }, [
    switchToNextTab,
    switchToPrevTab,
    closeCurrentTab,
    tabs,
    activeKey,
    onTabChange,
    onCloseOther,
    onCloseAll,
    onCloseLeft,
    onCloseRight
  ]);

  // 注册键盘事件监听器
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // 返回快捷键说明
  const getShortcutHelp = () => {
    return {
      'Ctrl+Tab / Ctrl+Shift+Tab': '切换到下一个/上一个标签',
      'Ctrl+W': '关闭当前标签',
      'Ctrl+1': '切换到第一个标签',
      'Ctrl+9': '切换到最后一个标签',
      'Ctrl+T': '新建标签',
      'Ctrl+N': '关闭其他标签',
      'Ctrl+A': '关闭所有标签',
      'Ctrl+L': '关闭左侧标签',
      'Ctrl+Shift+R': '关闭右侧标签'
    };
  };

  return {
    switchToNextTab,
    switchToPrevTab,
    closeCurrentTab,
    getShortcutHelp
  };
};
