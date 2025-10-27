/**
 * 页面标题组件
 * 提供统一的页面标题样式和布局
 */

import React from 'react';
import { Space } from 'antd';
import '../../../styles/page-title.css';

interface PageTitleProps {
  title: string;
  description?: string;
  size?: 'large' | 'medium' | 'small';
  actions?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const PageTitle: React.FC<PageTitleProps> = ({
  title,
  description,
  size = 'medium',
  actions,
  className,
  style
}) => {
  const getTitleClassName = () => {
    switch (size) {
      case 'large':
        return 'page-title page-title-large';
      case 'small':
        return 'page-title page-title-small';
      default:
        return 'page-title page-title-medium';
    }
  };

  return (
    <div className={`page-title-container ${className || ''}`} style={style}>
      <div>
        <h1 className={getTitleClassName()}>
          {title}
        </h1>
        {description && (
          <div className="page-title-description">
            {description}
          </div>
        )}
      </div>
      {actions && (
        <div className="page-title-actions">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageTitle;
