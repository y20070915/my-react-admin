/**
 * Tab标签持久化Hook
 * 用于保存和恢复Tab标签状态到localStorage
 */

import { useEffect, useCallback } from 'react';
import { TabItem } from './useTabs';

const STORAGE_KEY = 'admin-tabs';
const MAX_TABS = 20; // 最大保存标签数量

interface StoredTabData {
  tabs: TabItem[];
  activeKey: string;
  timestamp: number;
}

export const useTabPersistence = (
  tabs: TabItem[],
  activeKey: string,
  onTabsRestore: (tabs: TabItem[], activeKey: string) => void
) => {

  // 保存标签状态到localStorage
  const saveTabs = useCallback((tabsToSave: TabItem[], currentActiveKey: string) => {
    try {
      // 只保存可关闭的标签，避免保存固定标签
      const tabsToStore = tabsToSave.filter(tab => tab.closable);

      // 限制保存的标签数量
      const limitedTabs = tabsToStore.slice(-MAX_TABS);

      const data: StoredTabData = {
        tabs: limitedTabs,
        activeKey: currentActiveKey,
        timestamp: Date.now()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save tabs to localStorage:', error);
    }
  }, []);

  // 从localStorage恢复标签状态
  const restoreTabs = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const data: StoredTabData = JSON.parse(stored);

      // 检查数据是否过期（24小时）
      const isExpired = Date.now() - data.timestamp > 24 * 60 * 60 * 1000;
      if (isExpired) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      // 验证数据格式
      if (!Array.isArray(data.tabs) || typeof data.activeKey !== 'string') {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      // 恢复标签状态
      onTabsRestore(data.tabs, data.activeKey);
    } catch (error) {
      console.warn('Failed to restore tabs from localStorage:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [onTabsRestore]);

  // 清除保存的标签数据
  const clearStoredTabs = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear stored tabs:', error);
    }
  }, []);

  // 获取存储的标签数据
  const getStoredTabs = useCallback((): StoredTabData | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const data: StoredTabData = JSON.parse(stored);

      // 检查数据是否过期
      const isExpired = Date.now() - data.timestamp > 24 * 60 * 60 * 1000;
      if (isExpired) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Failed to get stored tabs:', error);
      return null;
    }
  }, []);

  // 监听标签变化，自动保存
  useEffect(() => {
    if (tabs.length > 0) {
      saveTabs(tabs, activeKey);
    }
  }, [tabs, activeKey, saveTabs]);

  // 页面加载时恢复标签
  useEffect(() => {
    restoreTabs();
  }, [restoreTabs]);

  // 页面卸载前保存标签
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveTabs(tabs, activeKey);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [tabs, activeKey, saveTabs]);

  return {
    saveTabs,
    restoreTabs,
    clearStoredTabs,
    getStoredTabs
  };
};
