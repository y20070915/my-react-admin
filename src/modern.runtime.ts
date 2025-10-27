import { defineRuntimeConfig } from '@modern-js/runtime';
import 'antd/dist/reset.css';

// 全局错误处理 - 过滤浏览器扩展错误
if (typeof window !== 'undefined') {
  // 处理 JavaScript 错误
  window.addEventListener('error', (event) => {
    // 过滤掉来自浏览器扩展的错误
    if (event.filename && (
      event.filename.includes('contentScript') ||
      event.filename.includes('extension') ||
      event.filename.includes('chrome-extension') ||
      event.filename.includes('moz-extension') ||
      event.filename.includes('safari-extension')
    )) {
      event.preventDefault();
      console.warn('Browser extension error caught and ignored:', event.error);
      return false;
    }
  });

  // 处理未捕获的 Promise 错误
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.stack && (
      event.reason.stack.includes('contentScript') ||
      event.reason.stack.includes('extension') ||
      event.reason.stack.includes('chrome-extension') ||
      event.reason.stack.includes('moz-extension') ||
      event.reason.stack.includes('safari-extension')
    )) {
      event.preventDefault();
      console.warn('Browser extension promise error caught and ignored:', event.reason);
      return false;
    }
  });
}

export default defineRuntimeConfig({});
