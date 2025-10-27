import { Helmet } from '@modern-js/runtime/head';
import { Form, Input, Button, Card, Select, message, Spin, Divider } from 'antd';
import { useNavigate, useParams } from '@modern-js/runtime/router';
import { useEffect, useState } from 'react';
import { http } from '@/utils/http';
import { FileUpload, PageTitle, PageContainer } from '@/components';
import { FileInfo, UploadConfig } from '@/types/upload';

const { TextArea } = Input;
const { Option } = Select;

interface FormData {
  name: string;
  description: string;
  status: string;
}

interface ApiResponse {
  code: number;
  message: string;
  data?: any;
}

export default function EditPage() {
  const navigate = useNavigate();
  const params = useParams();
  const [form] = Form.useForm<FormData>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 文件上传相关状态
  const [uploadedFiles, setUploadedFiles] = useState<FileInfo[]>([]);
  const [existingFiles, setExistingFiles] = useState<FileInfo[]>([]);

  // 文件上传配置
  const uploadConfig: UploadConfig = {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxFiles: 10,
    allowedTypes: [
      'image/*',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ],
    chunkSize: 2 * 1024 * 1024, // 2MB
    enableChunkedUpload: true,
    enableFolderUpload: true,
    uploadUrl: '/api/upload', // 这里应该是实际的上传接口
    headers: {
      'Authorization': 'Bearer your-token-here' // 实际使用时需要替换为真实的token
    },
    onProgress: (fileId, progress) => {
      console.log(`文件 ${fileId} 上传进度: ${progress}%`);
    },
    onSuccess: (fileId, response) => {
      message.success(`文件上传成功: ${response.filename || '未知文件'}`);
      console.log('上传成功:', response);
    },
    onError: (fileId, error) => {
      message.error(`文件上传失败: ${error}`);
      console.error('上传失败:', error);
    }
  };

  // 处理文件列表变化
  const handleFileListChange = (files: FileInfo[]) => {
    setUploadedFiles(files);
    console.log('当前文件列表:', files);
  };

  // 根据ID加载数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 使用 axios 获取数据
        const response = await http.get<ApiResponse>(`/list/${params.id}`);

        // 根据实际API响应结构处理
        if (response.code === 200 || response.code === 0) {
          form.setFieldsValue(response.data);

          // 处理现有文件
          if (response.data.files && Array.isArray(response.data.files)) {
            const files = response.data.files.map((file: any) => ({
              id: file.id || Math.random().toString(36).substr(2),
              name: file.name,
              size: file.size || 0,
              type: file.type || 'application/octet-stream',
              status: 'success' as const,
              progress: 100,
              url: file.url,
              folderPath: file.folderPath
            }));
            setExistingFiles(files);
            setUploadedFiles(files);
          }
        } else {
          message.error(response.message || '加载数据失败');
        }
      } catch (error: any) {
        console.error('加载数据失败:', error);

        // 错误处理
        const errorMessage = error.response?.data?.message
          || error.message
          || '加载数据失败';

        message.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id, form]);

  const onFinish = async (values: FormData) => {
    try {
      setSubmitting(true);

      // 准备提交数据，包含上传的文件信息
      const submitData = {
        ...values,
        files: uploadedFiles.filter(f => f.status === 'success').map(f => ({
          id: f.id,
          name: f.name,
          size: f.size,
          type: f.type,
          url: f.url,
          folderPath: f.folderPath
        }))
      };

      console.log('提交数据:', submitData);

      // 使用 axios 更新数据
      const response = await http.put<ApiResponse>(`/list/${params.id}`, submitData);

      // 根据实际API响应结构处理
      if (response.code === 200 || response.code === 0) {
        message.success('更新成功');
        navigate('/list');
      } else {
        message.error(response.message || '更新失败');
      }
    } catch (error: any) {
      console.error('更新失败:', error);

      // 处理错误信息
      const errorMessage = error.response?.data?.message
        || error.message
        || '更新失败，请稍后重试';

      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <Helmet>
        <title>编辑 - 后台管理系统</title>
      </Helmet>
      <PageTitle
        title={`编辑数据 (ID: ${params.id})`}
        description="修改现有数据记录"
        size="medium"
      />
      <Card>
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label="名称"
              name="name"
              rules={[
                { required: true, message: '请输入名称!' },
                { max: 50, message: '名称不能超过50个字符!' },
              ]}
            >
              <Input placeholder="请输入名称" />
            </Form.Item>

            <Form.Item
              label="描述"
              name="description"
              rules={[
                { required: true, message: '请输入描述!' },
                { max: 200, message: '描述不能超过200个字符!' },
              ]}
            >
              <TextArea rows={4} placeholder="请输入描述" showCount maxLength={200} />
            </Form.Item>

            <Form.Item
              label="状态"
              name="status"
              rules={[{ required: true, message: '请选择状态!' }]}
            >
              <Select placeholder="请选择状态">
                <Option value="启用">启用</Option>
                <Option value="禁用">禁用</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={submitting}>
                提交
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                onClick={() => navigate('/list')}
                disabled={submitting}
              >
                取消
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Card>

      {/* 文件上传区域 */}
      <Card title="📁 附件管理" style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 16, color: '#666' }}>
          <p>支持拖拽上传、文件夹上传、大文件分片上传，支持多种文件格式</p>
          <p>可以添加新文件或管理现有文件</p>
        </div>
        <FileUpload
          config={uploadConfig}
          onFileListChange={handleFileListChange}
        />
      </Card>
    </PageContainer>
  );
}
