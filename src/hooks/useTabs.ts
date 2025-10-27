/**
 * Tab标签状态管理Hook
 * 用于管理页面标签的打开、关闭、切换等操作
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from '@modern-js/runtime/router';
import { useTabPersistence } from './useTabPersistence';

export interface TabItem {
  key: string;                    // 唯一标识
  title: string;                  // 标签标题
  path: string;                   // 页面路径
  closable?: boolean;             // 是否可关闭
  lastActiveTime?: number;        // 最后活跃时间
  params?: Record<string, any>;   // 页面参数
}

interface UseTabsReturn {
  tabs: TabItem[];                // 标签列表
  activeKey: string;              // 当前活跃标签
  addTab: (tab: Omit<TabItem, 'key' | 'lastActiveTime'>) => void;  // 添加标签
  removeTab: (key: string) => void;  // 移除标签
  setActiveKey: (key: string) => void;  // 设置活跃标签
  closeOtherTabs: (key: string) => void;  // 关闭其他标签
  closeAllTabs: () => void;       // 关闭所有标签
  closeLeftTabs: (key: string) => void;  // 关闭左侧标签
  closeRightTabs: (key: string) => void; // 关闭右侧标签
  getTabByPath: (path: string) => TabItem | undefined; // 根据路径获取标签
}

// 默认标签配置
const DEFAULT_TAB_CONFIG: Record<string, Partial<TabItem>> = {
  '/': {
    title: '首页',
    closable: false
  },
  '/list': {
    title: '数据列表',
    closable: true
  },
  '/list/create': {
    title: '新建数据',
    closable: true
  },
  '/employees': {
    title: '员工管理',
    closable: true
  },
  '/roles': {
    title: '角色管理',
    closable: true
  },
  '/login': {
    title: '登录',
    closable: true
  }
};

// 生成标签key
const generateTabKey = (path: string, params?: Record<string, any>): string => {
  if (params && Object.keys(params).length > 0) {
    const paramStr = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    return `${path}?${paramStr}`;
  }
  return path;
};

// 从路径解析参数
const parseParamsFromPath = (path: string): { cleanPath: string; params: Record<string, any> } => {
  const [cleanPath, queryString] = path.split('?');
  const params: Record<string, any> = {};

  if (queryString) {
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      if (key && value) {
        params[key] = decodeURIComponent(value);
      }
    });
  }

  return { cleanPath, params };
};

export const useTabs = (): UseTabsReturn => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [activeKey, setActiveKey] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const lastPathRef = useRef<string>('');

  // 恢复标签状态的回调
  const handleTabsRestore = useCallback((restoredTabs: TabItem[], restoredActiveKey: string) => {
    if (restoredTabs.length > 0) {
      setTabs(restoredTabs);
      setActiveKey(restoredActiveKey);
    }
    setIsInitialized(true);
  }, []);

  // 持久化功能
  useTabPersistence(tabs, activeKey, handleTabsRestore);

  // 初始化默认标签（仅在未恢复数据时）
  useEffect(() => {
    if (!isInitialized) {
      const initialTab: TabItem = {
        key: '/',
        title: '首页',
        path: '/',
        closable: false,
        lastActiveTime: Date.now()
      };
      setTabs([initialTab]);
      setActiveKey('/');
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // 监听路由变化，自动添加标签
  useEffect(() => {
    if (!isInitialized) return;

    const currentPath = location.pathname;

    // 避免重复处理相同的路径
    if (lastPathRef.current === currentPath) return;
    lastPathRef.current = currentPath;

    const { cleanPath, params } = parseParamsFromPath(currentPath);
    const tabKey = generateTabKey(currentPath, params);

    setTabs(prev => {
      // 如果当前标签已存在，更新活跃状态
      const existingTab = prev.find(tab => tab.key === tabKey);
      if (existingTab) {
        // 更新最后活跃时间
        const updated = prev.map(tab =>
          tab.key === tabKey
            ? { ...tab, lastActiveTime: Date.now() }
            : tab
        );
        return updated;
      }

      // 获取标签配置
      const config = DEFAULT_TAB_CONFIG[cleanPath] || {
        title: cleanPath.split('/').pop() || '未知页面',
        closable: true
      };

      // 创建新标签
      const newTab: TabItem = {
        key: tabKey,
        title: config.title || cleanPath.split('/').pop() || '未知页面',
        path: currentPath,
        closable: config.closable !== false,
        lastActiveTime: Date.now(),
        params
      };

      // 检查是否已存在相同路径的标签
      const existingIndex = prev.findIndex(tab => tab.path === currentPath);
      if (existingIndex >= 0) {
        // 更新现有标签
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...newTab };
        return updated;
      }
      // 添加新标签
      return [...prev, newTab];
    });

    setActiveKey(tabKey);
  }, [location.pathname, isInitialized]);

  // 添加标签
  const addTab = useCallback((tab: Omit<TabItem, 'key' | 'lastActiveTime'>) => {
    const tabKey = generateTabKey(tab.path, tab.params);
    const newTab: TabItem = {
      ...tab,
      key: tabKey,
      lastActiveTime: Date.now()
    };

    setTabs(prev => {
      const existingIndex = prev.findIndex(t => t.key === tabKey);
      if (existingIndex >= 0) {
        // 更新现有标签
        const updated = [...prev];
        updated[existingIndex] = newTab;
        return updated;
      }
      // 添加新标签
      return [...prev, newTab];
    });

    setActiveKey(tabKey);
  }, []);

  // 移除标签
  const removeTab = useCallback((key: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.key !== key);

      // 如果删除的是当前活跃标签，需要切换到其他标签
      if (key === activeKey && newTabs.length > 0) {
        const currentIndex = prev.findIndex(tab => tab.key === key);
        let newActiveKey = '';

        // 优先选择右侧标签
        if (currentIndex < newTabs.length) {
          newActiveKey = newTabs[currentIndex].key;
        } else {
          // 否则选择左侧标签
          newActiveKey = newTabs[currentIndex - 1].key;
        }

        setActiveKey(newActiveKey);
        navigate(newTabs.find(tab => tab.key === newActiveKey)?.path || '/');
      }

      return newTabs;
    });
  }, [activeKey, navigate]);

  // 设置活跃标签
  const switchToTab = useCallback((key: string) => {
    const tab = tabs.find(t => t.key === key);
    if (tab) {
      setActiveKey(key);
      navigate(tab.path);
    }
  }, [tabs, navigate]);


  // 关闭其他标签
  const closeOtherTabs = useCallback((key: string) => {
    setTabs(prev => prev.filter(tab => tab.key === key || !tab.closable));
    setActiveKey(key);
  }, []);

  // 关闭所有标签
  const closeAllTabs = useCallback(() => {
    setTabs(prev => prev.filter(tab => !tab.closable));
    setActiveKey('/');
    navigate('/');
  }, [navigate]);

  // 关闭左侧标签
  const closeLeftTabs = useCallback((key: string) => {
    setTabs(prev => {
      const currentIndex = prev.findIndex(tab => tab.key === key);
      return prev.filter((tab, index) => index >= currentIndex || !tab.closable);
    });
  }, []);

  // 关闭右侧标签
  const closeRightTabs = useCallback((key: string) => {
    setTabs(prev => {
      const currentIndex = prev.findIndex(tab => tab.key === key);
      return prev.filter((tab, index) => index <= currentIndex || !tab.closable);
    });
  }, []);


  // 根据路径获取标签
  const getTabByPath = useCallback((path: string) => {
    return tabs.find(tab => tab.path === path);
  }, [tabs]);

  return {
    tabs,
    activeKey,
    addTab,
    removeTab,
    setActiveKey: switchToTab,
    closeOtherTabs,
    closeAllTabs,
    closeLeftTabs,
    closeRightTabs,
    getTabByPath
  };
};
