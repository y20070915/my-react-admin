/**
 * 错误边界组件
 * 用于捕获和处理React组件树中的JavaScript错误
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 过滤掉浏览器扩展错误
    if (error.stack && (
      error.stack.includes('contentScript') ||
      error.stack.includes('extension') ||
      error.stack.includes('chrome-extension') ||
      error.stack.includes('moz-extension') ||
      error.stack.includes('safari-extension')
    )) {
      console.warn('Browser extension error caught by ErrorBoundary:', error);
      // 重置错误状态，不显示错误UI
      this.setState({ hasError: false });
      return;
    }

    // 记录其他错误
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // 自定义错误UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Result
          status="error"
          title="页面出现错误"
          subTitle="抱歉，页面遇到了一个错误。请尝试刷新页面或联系技术支持。"
          extra={[
            <Button type="primary" key="refresh" onClick={() => window.location.reload()}>
              刷新页面
            </Button>,
            <Button key="reset" onClick={this.handleReset}>
              重试
            </Button>
          ]}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
