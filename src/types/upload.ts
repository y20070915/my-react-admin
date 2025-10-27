/**
 * 文件上传相关的类型定义
 */

// 文件上传状态枚举
export enum UploadStatus {
  PENDING = 'pending',     // 等待上传
  UPLOADING = 'uploading', // 上传中
  SUCCESS = 'success',     // 上传成功
  ERROR = 'error',         // 上传失败
  CANCELLED = 'cancelled', // 已取消
}

// 文件信息接口
export interface FileInfo {
  id: string;                    // 唯一标识
  file: File;                    // 原始文件对象
  name: string;                  // 文件名
  size: number;                  // 文件大小（字节）
  type: string;                  // MIME类型
  status: UploadStatus;          // 上传状态
  progress: number;              // 上传进度（0-100）
  error?: string;                // 错误信息
  url?: string;                  // 上传成功后的文件URL
  chunkIndex?: number;           // 当前分片索引（用于大文件分片上传）
  totalChunks?: number;          // 总分片数
  folderPath?: string;           // 文件夹路径（用于文件夹上传）
}

// 上传配置接口
export interface UploadConfig {
  maxFileSize?: number;          // 单个文件最大大小（字节）
  maxFiles?: number;             // 最大文件数量
  allowedTypes?: string[];       // 允许的文件类型
  chunkSize?: number;            // 分片大小（字节）
  enableChunkedUpload?: boolean; // 是否启用分片上传
  enableFolderUpload?: boolean;  // 是否启用文件夹上传
  uploadUrl: string;             // 上传接口URL
  headers?: Record<string, string>; // 请求头
  onProgress?: (fileId: string, progress: number) => void; // 进度回调
  onSuccess?: (fileId: string, response: any) => void;     // 成功回调
  onError?: (fileId: string, error: string) => void;       // 错误回调
}

// WebWorker消息类型
export interface WorkerMessage {
  type: 'UPLOAD_CHUNK' | 'UPLOAD_COMPLETE' | 'UPLOAD_ERROR';
  fileId: string;
  chunkIndex: number;
  totalChunks: number;
  chunk: ArrayBuffer;
  uploadUrl: string;
  headers?: Record<string, string>;
}

// WebWorker响应类型
export interface WorkerResponse {
  type: 'PROGRESS' | 'SUCCESS' | 'ERROR';
  fileId: string;
  chunkIndex: number;
  progress: number;
  error?: string;
  response?: any;
}

// 文件夹上传结果
export interface FolderUploadResult {
  files: FileInfo[];
  totalFiles: number;
  totalSize: number;
  successCount: number;
  errorCount: number;
}

// 文件验证结果
export interface FileValidationResult {
  valid: boolean;
  errors: string[];
}
