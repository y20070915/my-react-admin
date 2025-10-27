/**
 * 文件处理工具函数
 */

import { FileInfo, UploadStatus, FileValidationResult } from '@/types/upload';

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 生成唯一ID
 * @returns 唯一标识符
 */
export const generateFileId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * 验证文件类型
 * @param file 文件对象
 * @param allowedTypes 允许的类型数组
 * @returns 是否允许该类型
 */
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  if (!allowedTypes || allowedTypes.length === 0) return true;

  return allowedTypes.some(type => {
    if (type.startsWith('.')) {
      // 扩展名匹配
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    } else if (type.includes('*')) {
      // 通配符匹配
      const pattern = type.replace('*', '.*');
      const regex = new RegExp(`^${pattern}$`, 'i');
      return regex.test(file.type);
    } else {
      // MIME类型匹配
      return file.type === type;
    }
  });
};

/**
 * 验证文件大小
 * @param file 文件对象
 * @param maxSize 最大大小（字节）
 * @returns 是否在允许范围内
 */
export const validateFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

/**
 * 验证文件
 * @param file 文件对象
 * @param config 上传配置
 * @returns 验证结果
 */
export const validateFile = (file: File, config: {
  maxFileSize?: number;
  allowedTypes?: string[];
}): FileValidationResult => {
  const errors: string[] = [];

  // 检查文件大小
  if (config.maxFileSize && !validateFileSize(file, config.maxFileSize)) {
    errors.push(`文件大小不能超过 ${formatFileSize(config.maxFileSize)}`);
  }

  // 检查文件类型
  if (config.allowedTypes && !validateFileType(file, config.allowedTypes)) {
    errors.push(`不支持的文件类型，仅支持：${config.allowedTypes.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * 创建文件信息对象
 * @param file 文件对象
 * @param folderPath 文件夹路径（可选）
 * @returns 文件信息对象
 */
export const createFileInfo = (file: File, folderPath?: string): FileInfo => {
  return {
    id: generateFileId(),
    file,
    name: file.name,
    size: file.size,
    type: file.type,
    status: UploadStatus.PENDING,
    progress: 0,
    folderPath
  };
};

/**
 * 从DataTransferItemList创建文件信息数组
 * @param items DataTransferItemList
 * @param config 上传配置
 * @returns 文件信息数组
 */
export const createFileInfoFromItems = async (
  items: DataTransferItemList,
  config: {
    maxFileSize?: number;
    allowedTypes?: string[];
    enableFolderUpload?: boolean;
  }
): Promise<FileInfo[]> => {
  const fileInfos: FileInfo[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (item.kind === 'file') {
      if (config.enableFolderUpload && item.webkitGetAsEntry) {
        // 处理文件夹上传
        const entry = item.webkitGetAsEntry();
        if (entry) {
          const folderFiles = await getFilesFromEntry(entry, '', config);
          fileInfos.push(...folderFiles);
        }
      } else {
        // 处理单个文件
        const file = item.getAsFile();
        if (file) {
          const validation = validateFile(file, config);
          if (validation.valid) {
            fileInfos.push(createFileInfo(file));
          }
        }
      }
    }
  }

  return fileInfos;
};

/**
 * 从文件系统条目递归获取文件
 * @param entry 文件系统条目
 * @param path 当前路径
 * @param config 验证配置
 * @returns 文件信息数组
 */
const getFilesFromEntry = async (
  entry: any,
  path: string,
  config: {
    maxFileSize?: number;
    allowedTypes?: string[];
  }
): Promise<FileInfo[]> => {
  const files: FileInfo[] = [];

  if (entry.isFile) {
    return new Promise((resolve) => {
      entry.file((file: File) => {
        const validation = validateFile(file, config);
        if (validation.valid) {
          files.push(createFileInfo(file, path));
        }
        resolve(files);
      });
    });
  } else if (entry.isDirectory) {
    const reader = entry.createReader();
    const entries = await new Promise<any[]>((resolve) => {
      reader.readEntries(resolve);
    });

    for (const subEntry of entries) {
      const subPath = path ? `${path}/${subEntry.name}` : subEntry.name;
      const subFiles = await getFilesFromEntry(subEntry, subPath, config);
      files.push(...subFiles);
    }
  }

  return files;
};

/**
 * 计算文件分片数量
 * @param fileSize 文件大小
 * @param chunkSize 分片大小
 * @returns 分片数量
 */
export const calculateChunkCount = (fileSize: number, chunkSize: number): number => {
  return Math.ceil(fileSize / chunkSize);
};

/**
 * 创建文件分片
 * @param file 文件对象
 * @param chunkIndex 分片索引
 * @param chunkSize 分片大小
 * @returns 分片数据
 */
export const createFileChunk = async (file: File, chunkIndex: number, chunkSize: number): Promise<ArrayBuffer> => {
  const start = chunkIndex * chunkSize;
  const end = Math.min(start + chunkSize, file.size);
  return await file.slice(start, end).arrayBuffer();
};

/**
 * 检查是否支持文件夹上传
 * @returns 是否支持
 */
export const isFolderUploadSupported = (): boolean => {
  return !!(window.DataTransferItem && window.DataTransferItem.prototype.webkitGetAsEntry);
};

/**
 * 检查是否支持WebWorker
 * @returns 是否支持
 */
export const isWebWorkerSupported = (): boolean => {
  return typeof Worker !== 'undefined';
};
