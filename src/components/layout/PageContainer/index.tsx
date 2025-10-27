/**
 * 页面容器组件
 * 提供统一的页面布局和样式
 */

import React from 'react';
import './PageContainer.css';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  maxWidth?: number | string;
  padding?: number | string;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  style,
  maxWidth = 'none',
  padding = 24
}) => {
  const containerStyle: React.CSSProperties = {
    maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
    padding: typeof padding === 'number' ? `${padding}px` : padding,
    ...style
  };

  return (
    <div
      className={`page-container ${className || ''}`}
      style={containerStyle}
    >
      {children}
    </div>
  );
};

export default PageContainer;
