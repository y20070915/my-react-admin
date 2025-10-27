/**
 * 文件上传组件
 * 支持拖拽上传、文件夹上传、WebWorker大文件上传、多文件上传进度管理
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Button,
  Progress,
  List,
  Typography,
  Space,
  message,
  Modal,
  Tooltip,
  Tag,
  Card,
  Divider
} from 'antd';
import {
  InboxOutlined,
  FolderOutlined,
  FileOutlined,
  DeleteOutlined,
  UploadOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { FileInfo, UploadStatus, UploadConfig } from '@/types/upload';
import {
  formatFileSize,
  createFileInfo,
  createFileInfoFromItems,
  validateFile,
  calculateChunkCount,
  createFileChunk,
  isFolderUploadSupported,
  isWebWorkerSupported
} from '@/utils/fileUtils';
import './FileUpload.css';

const { Text, Title } = Typography;

interface FileUploadProps {
  config: UploadConfig;
  onFileListChange?: (files: FileInfo[]) => void;
  className?: string;
  style?: React.CSSProperties;
}

// 默认配置
const defaultConfig: Partial<UploadConfig> = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  maxFiles: 10,
  allowedTypes: [],
  chunkSize: 2 * 1024 * 1024, // 2MB
  enableChunkedUpload: true,
  enableFolderUpload: true,
  headers: {}
};

const FileUpload: React.FC<FileUploadProps> = ({
  config,
  onFileListChange,
  className,
  style
}) => {
  // 合并配置
  const finalConfig = { ...defaultConfig, ...config };

  // 状态管理
  const [fileList, setFileList] = useState<FileInfo[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFileInfo, setPreviewFileInfo] = useState<FileInfo | null>(null);

  // 引用
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);

  // 初始化WebWorker
  useEffect(() => {
    if (isWebWorkerSupported() && finalConfig.enableChunkedUpload) {
      // 创建WebWorker - 内联worker代码
      const workerCode = `
        // WebWorker代码
        self.onmessage = async (event) => {
          const { type, fileId, chunkIndex, totalChunks, chunk, uploadUrl, headers } = event.data;

          try {
            if (type === 'UPLOAD_CHUNK') {
              const formData = new FormData();
              formData.append('file', new Blob([chunk]));
              formData.append('fileId', fileId);
              formData.append('chunkIndex', chunkIndex.toString());
              formData.append('totalChunks', totalChunks.toString());

              const response = await fetch(uploadUrl, {
                method: 'POST',
                body: formData,
                headers: headers || {}
              });

              if (!response.ok) {
                throw new Error(\`上传失败: \${response.status} \${response.statusText}\`);
              }

              const result = await response.json();
              const progress = Math.round(((chunkIndex + 1) / totalChunks) * 100);

              self.postMessage({
                type: 'PROGRESS',
                fileId,
                chunkIndex,
                progress
              });

              if (chunkIndex === totalChunks - 1) {
                self.postMessage({
                  type: 'SUCCESS',
                  fileId,
                  chunkIndex,
                  progress: 100,
                  response: result
                });
              }
            }
          } catch (error) {
            self.postMessage({
              type: 'ERROR',
              fileId,
              chunkIndex,
              progress: 0,
              error: error.message || '上传失败'
            });
          }
        };
      `;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      workerRef.current = new Worker(URL.createObjectURL(blob));

      // 监听Worker消息
      workerRef.current.onmessage = (event) => {
        const { type, fileId, chunkIndex, progress, error, response } = event.data;

        setFileList(prevList => {
          return prevList.map(file => {
            if (file.id === fileId) {
              switch (type) {
                case 'PROGRESS':
                  return { ...file, progress };
                case 'SUCCESS':
                  return {
                    ...file,
                    status: UploadStatus.SUCCESS,
                    progress: 100,
                    url: response?.url
                  };
                case 'ERROR':
                  return {
                    ...file,
                    status: UploadStatus.ERROR,
                    error: error
                  };
                default:
                  return file;
              }
            }
            return file;
          });
        });
      };
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [finalConfig.enableChunkedUpload]);

  // 文件列表变化回调
  useEffect(() => {
    onFileListChange?.(fileList);
  }, [fileList, onFileListChange]);

  // 防止页面其他区域的拖拽行为
  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault();
    };

    document.addEventListener('dragover', handleGlobalDragOver);
    document.addEventListener('drop', handleGlobalDrop);

    return () => {
      document.removeEventListener('dragover', handleGlobalDragOver);
      document.removeEventListener('drop', handleGlobalDrop);
    };
  }, []);

  /**
   * 处理文件选择
   * @param files 文件列表
   */
  const handleFileSelect = useCallback(async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;

    const newFiles: FileInfo[] = [];

    // 处理每个文件
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const validation = validateFile(file, {
        maxFileSize: finalConfig.maxFileSize,
        allowedTypes: finalConfig.allowedTypes
      });

      if (validation.valid) {
        newFiles.push(createFileInfo(file));
      } else {
        message.error(`${file.name}: ${validation.errors.join(', ')}`);
      }
    }

    if (newFiles.length > 0) {
      setFileList(prev => {
        // 检查文件数量限制
        if (prev.length + newFiles.length > (finalConfig.maxFiles || 10)) {
          message.error(`最多只能上传 ${finalConfig.maxFiles} 个文件`);
          return prev;
        }

        // 防重复处理：过滤掉已存在的文件
        const filteredNewFiles = newFiles.filter(newFile =>
          !prev.some(existingFile =>
            existingFile.file.name === newFile.file.name &&
            existingFile.file.size === newFile.file.size &&
            existingFile.file.lastModified === newFile.file.lastModified
          )
        );

        if (filteredNewFiles.length === 0) {
          console.log('All files already exist in current list, skipping...');
          return prev;
        }

        console.log(`Adding ${filteredNewFiles.length} new files out of ${newFiles.length} selected`);
        return [...prev, ...filteredNewFiles];
      });
    }
  }, [finalConfig]);

  /**
   * 处理拖拽事件
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 只有当拖拽离开整个拖拽区域时才取消拖拽状态
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const items = e.dataTransfer.items;
    if (items && items.length > 0) {
      try {
        const files = await createFileInfoFromItems(items, {
          maxFileSize: finalConfig.maxFileSize,
          allowedTypes: finalConfig.allowedTypes,
          enableFolderUpload: finalConfig.enableFolderUpload
        });

        // 将 FileInfo[] 转换为 File[] 以使用 handleFileSelect
        const fileObjects = files.map(fileInfo => fileInfo.file);
        handleFileSelect(fileObjects as any);
      } catch (error) {
        message.error('处理文件失败');
        console.error('处理拖拽文件失败:', error);
      }
    }
  }, [handleFileSelect, finalConfig]);

  /**
   * 上传文件
   * @param fileInfo 文件信息
   */
  const uploadFile = useCallback(async (fileInfo: FileInfo) => {
    const { file, id } = fileInfo;

    // 更新状态为上传中
    setFileList(prev => prev.map(f =>
      f.id === id ? { ...f, status: UploadStatus.UPLOADING } : f
    ));

    try {
      // 检查是否需要分片上传
      const shouldChunk = finalConfig.enableChunkedUpload &&
                         file.size > (finalConfig.chunkSize || 2 * 1024 * 1024) &&
                         workerRef.current;

      if (shouldChunk) {
        // 使用WebWorker进行分片上传
        const chunkSize = finalConfig.chunkSize || 2 * 1024 * 1024;
        const totalChunks = calculateChunkCount(file.size, chunkSize);

        // 更新总分片数
        setFileList(prev => prev.map(f =>
          f.id === id ? { ...f, totalChunks } : f
        ));

        // 发送分片到Worker
        for (let i = 0; i < totalChunks; i++) {
          const chunk = await createFileChunk(file, i, chunkSize);
          const message = {
            type: 'UPLOAD_CHUNK' as const,
            fileId: id,
            chunkIndex: i,
            totalChunks,
            chunk,
            uploadUrl: finalConfig.uploadUrl,
            headers: finalConfig.headers
          };
          workerRef.current!.postMessage(message);
        }
      } else {
        // 普通上传
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(finalConfig.uploadUrl, {
          method: 'POST',
          body: formData,
          headers: finalConfig.headers
        });

        if (!response.ok) {
          throw new Error(`上传失败: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        // 更新为成功状态
        setFileList(prev => prev.map(f =>
          f.id === id ? {
            ...f,
            status: UploadStatus.SUCCESS,
            progress: 100,
            url: result.url
          } : f
        ));

        // 调用成功回调
        finalConfig.onSuccess?.(id, result);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传失败';

      // 更新为错误状态
      setFileList(prev => prev.map(f =>
        f.id === id ? {
          ...f,
          status: UploadStatus.ERROR,
          error: errorMessage
        } : f
      ));

      // 调用错误回调
      finalConfig.onError?.(id, errorMessage);
    }
  }, [finalConfig]);

  /**
   * 开始上传所有文件
   */
  const startUpload = useCallback(() => {
    const pendingFiles = fileList.filter(f => f.status === UploadStatus.PENDING);
    pendingFiles.forEach(uploadFile);
  }, [fileList, uploadFile]);

  /**
   * 删除文件
   * @param fileId 文件ID
   */
  const removeFile = useCallback((fileId: string) => {
    setFileList(prev => prev.filter(f => f.id !== fileId));
  }, []);

  /**
   * 清空所有文件
   */
  const clearAll = useCallback(() => {
    setFileList([]);
    // 清空原生 input 的值
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  /**
   * 预览文件
   * @param fileInfo 文件信息
   */
  const handlePreviewFile = useCallback((fileInfo: FileInfo) => {
    setPreviewFileInfo(fileInfo);
    setShowPreview(true);
  }, []);

  /**
   * 获取状态图标
   * @param status 上传状态
   */
  const getStatusIcon = (status: UploadStatus) => {
    switch (status) {
      case UploadStatus.SUCCESS:
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case UploadStatus.ERROR:
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      case UploadStatus.UPLOADING:
        return <UploadOutlined style={{ color: '#1890ff' }} />;
      default:
        return <FileOutlined />;
    }
  };

  /**
   * 获取状态标签颜色
   * @param status 上传状态
   */
  const getStatusColor = (status: UploadStatus) => {
    switch (status) {
      case UploadStatus.SUCCESS:
        return 'success';
      case UploadStatus.ERROR:
        return 'error';
      case UploadStatus.UPLOADING:
        return 'processing';
      case UploadStatus.CANCELLED:
        return 'default';
      default:
        return 'default';
    }
  };

  /**
   * 获取状态文本
   * @param status 上传状态
   */
  const getStatusText = (status: UploadStatus) => {
    switch (status) {
      case UploadStatus.PENDING:
        return '等待上传';
      case UploadStatus.UPLOADING:
        return '上传中';
      case UploadStatus.SUCCESS:
        return '上传成功';
      case UploadStatus.ERROR:
        return '上传失败';
      case UploadStatus.CANCELLED:
        return '已取消';
      default:
        return '未知状态';
    }
  };

  return (
    <div className={`file-upload-container ${className || ''}`} style={style}>
      {/* 拖拽上传区域 */}
      <Card>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`file-upload-dragger ${isDragOver ? 'drag-over' : ''}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              console.log('Native input onChange triggered');
              const files = e.target.files;
              if (files && files.length > 0) {
                console.log('Files to process:', files.length);
                handleFileSelect(files);
                // 清空 input 的值，允许重复选择相同文件
                e.target.value = '';
              }
            }}
          />
          <p className="file-upload-drag-icon">
            <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          </p>
          <p className="file-upload-text">
            点击或拖拽文件到此区域上传
          </p>
          <p className="file-upload-hint">
            支持单个或批量上传，支持文件夹拖拽
            {finalConfig.maxFileSize && (
              <span>，单个文件不超过 {formatFileSize(finalConfig.maxFileSize)}</span>
            )}
            {finalConfig.allowedTypes && finalConfig.allowedTypes.length > 0 && (
              <span>，支持格式：{finalConfig.allowedTypes.join(', ')}</span>
            )}
          </p>
        </div>

        {/* 操作按钮 */}
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Space>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={startUpload}
              disabled={fileList.filter(f => f.status === UploadStatus.PENDING).length === 0}
            >
              开始上传
            </Button>
            <Button
              icon={<DeleteOutlined />}
              onClick={clearAll}
              disabled={fileList.length === 0}
            >
              清空列表
            </Button>
          </Space>
        </div>
      </Card>

      {/* 文件列表 */}
      {fileList.length > 0 && (
        <Card title={`文件列表 (${fileList.length})`} style={{ marginTop: 16 }}>
          <List
            className="file-upload-list"
            dataSource={fileList}
            renderItem={(fileInfo) => (
              <List.Item
                className={`file-upload-list-item ${fileInfo.status}`}
                actions={[
                  <Tooltip title="预览">
                    <Button
                      type="text"
                      icon={<FileOutlined />}
                      onClick={() => handlePreviewFile(fileInfo)}
                      className="file-upload-action-button"
                    />
                  </Tooltip>,
                  <Tooltip title="删除">
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeFile(fileInfo.id)}
                      className="file-upload-action-button"
                    />
                  </Tooltip>
                ]}
              >
                <List.Item.Meta
                  avatar={getStatusIcon(fileInfo.status)}
                  title={
                    <Space>
                      <Text strong>{fileInfo.name}</Text>
                      <Tag color={getStatusColor(fileInfo.status)}>
                        {getStatusText(fileInfo.status)}
                      </Tag>
                      {fileInfo.folderPath && (
                        <Tag icon={<FolderOutlined />} color="blue">
                          {fileInfo.folderPath}
                        </Tag>
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Text type="secondary">
                        {formatFileSize(fileInfo.size)} • {fileInfo.type}
                      </Text>
                      {fileInfo.status === UploadStatus.UPLOADING && (
                        <div className="file-upload-progress-container">
                          <Progress
                            percent={fileInfo.progress}
                            size="small"
                            status="active"
                            className="file-upload-progress"
                          />
                          <div className="file-upload-progress-text">
                            {fileInfo.progress}% - {fileInfo.chunkIndex !== undefined && fileInfo.totalChunks ?
                              `分片 ${fileInfo.chunkIndex + 1}/${fileInfo.totalChunks}` :
                              '上传中...'
                            }
                          </div>
                        </div>
                      )}
                      {fileInfo.error && (
                        <Text type="danger" className="file-upload-error-text">
                          {fileInfo.error}
                        </Text>
                      )}
                      {fileInfo.url && (
                        <Text type="success" className="file-upload-success-text">
                          上传成功: {fileInfo.url}
                        </Text>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* 文件预览模态框 */}
      <Modal
        title="文件预览"
        open={showPreview}
        onCancel={() => setShowPreview(false)}
        footer={null}
        width={800}
        className="file-upload-preview-modal"
      >
        {previewFileInfo && (
          <div className="file-upload-preview-content">
            <Space direction="vertical" style={{ width: '100%' }} className="file-upload-preview-info">
              <div className="file-upload-preview-info-item">
                <span className="file-upload-preview-info-label">文件名:</span>
                <span className="file-upload-preview-info-value">{previewFileInfo.name}</span>
              </div>
              <div className="file-upload-preview-info-item">
                <span className="file-upload-preview-info-label">大小:</span>
                <span className="file-upload-preview-info-value">{formatFileSize(previewFileInfo.size)}</span>
              </div>
              <div className="file-upload-preview-info-item">
                <span className="file-upload-preview-info-label">类型:</span>
                <span className="file-upload-preview-info-value">{previewFileInfo.type}</span>
              </div>
              <div className="file-upload-preview-info-item">
                <span className="file-upload-preview-info-label">状态:</span>
                <span className="file-upload-preview-info-value">{getStatusText(previewFileInfo.status)}</span>
              </div>
              {previewFileInfo.folderPath && (
                <div className="file-upload-preview-info-item">
                  <span className="file-upload-preview-info-label">路径:</span>
                  <span className="file-upload-preview-info-value">{previewFileInfo.folderPath}</span>
                </div>
              )}
              {previewFileInfo.url && (
                <div className="file-upload-preview-info-item">
                  <span className="file-upload-preview-info-label">URL:</span>
                  <span className="file-upload-preview-info-value">{previewFileInfo.url}</span>
                </div>
              )}
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FileUpload;
