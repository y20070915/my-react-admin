/**
 * Sticky组件 - 智能吸附组件
 * 提供向下滚动时吸附置顶，向上滚动时恢复原位置的功能
 */

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import './Sticky.css';

interface StickyProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  threshold?: number; // 触发阈值，默认80px
  hideThreshold?: number; // 隐藏阈值，默认50px
  disabled?: boolean; // 是否禁用吸附功能
  onStickyChange?: (isSticky: boolean) => void; // 吸附状态变化回调
}

const Sticky: React.FC<StickyProps> = ({
  children,
  className = '',
  style,
  threshold = 80,
  hideThreshold = 50,
  disabled = false,
  onStickyChange
}) => {
  const [isSticky, setIsSticky] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const stickyRef = useRef<HTMLDivElement>(null);
  const originalPositionRef = useRef<{ top: number; left: number; width: number } | null>(null);

  // 保存原始位置
  useEffect(() => {
    if (stickyRef.current && !disabled) {
      const rect = stickyRef.current.getBoundingClientRect();
      originalPositionRef.current = {
        top: rect.top + window.scrollY,
        left: rect.left,
        width: rect.width
      };
    }
  }, [disabled]);

  // 滚动监听逻辑
  useEffect(() => {
    if (disabled) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDelta = currentScrollY - lastScrollY;

          // 向下滚动时显示sticky，向上滚动时隐藏
          if (scrollDelta > 0 && currentScrollY > threshold) {
            // 向下滚动且超过阈值时，显示sticky
            if (!isSticky) {
              setIsSticky(true);
              onStickyChange?.(true);
            }
          } else if (scrollDelta < 0 || currentScrollY <= hideThreshold) {
            // 向上滚动或回到顶部时，隐藏sticky
            if (isSticky) {
              setIsSticky(false);
              onStickyChange?.(false);
            }
          }

          setLastScrollY(currentScrollY);
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isSticky, threshold, hideThreshold, disabled, onStickyChange]);

  return (
    <div
      ref={stickyRef}
      className={`sticky-container ${isSticky ? 'sticky-active' : ''} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default Sticky;
