import { Helmet } from '@modern-js/runtime/head';
import { Form, Input, Button, Card, Select, message, Checkbox, Spin } from 'antd';
import { useNavigate, useParams } from '@modern-js/runtime/router';
import { useEffect, useState } from 'react';
import { http } from '@/utils/http';

const { Option } = Select;
const CheckboxGroup = Checkbox.Group;

interface FormData {
  name: string;
  code: string;
  description: string;
  permissions: string[];
  status: 'enabled' | 'disabled';
}

const allPermissions = [
  { label: '用户创建', value: 'user:create' },
  { label: '用户读取', value: 'user:read' },
  { label: '用户更新', value: 'user:update' },
  { label: '用户删除', value: 'user:delete' },
  { label: '角色管理', value: 'role:manage' },
  { label: '数据导出', value: 'data:export' },
  { label: '系统配置', value: 'system:config' },
];

export default function EditRolePage() {
  const navigate = useNavigate();
  const params = useParams();
  const [form] = Form.useForm<FormData>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockData: Record<string, FormData> = {
          '1': {
            name: '管理员',
            code: 'admin',
            description: '拥有所有权限的管理员角色',
            permissions: ['user:create', 'user:read', 'user:update', 'user:delete', 'role:manage'],
            status: 'enabled',
          },
          '2': {
            name: '普通用户',
            code: 'user',
            description: '普通用户权限',
            permissions: ['user:read'],
            status: 'enabled',
          },
          '3': {
            name: '审核员',
            code: 'auditor',
            description: '数据审核权限',
            permissions: ['user:read', 'user:update'],
            status: 'enabled',
          },
        };

        const data = mockData[params.id || '1'] || mockData['1'];
        form.setFieldsValue(data);
      } catch (error) {
        message.error('加载数据失败');
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
      console.log('更新数据:', values);
      await new Promise(resolve => setTimeout(resolve, 800));

      message.success('更新成功');
      navigate('/roles');
    } catch (error: any) {
      message.error(error.message || '更新失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Helmet>
        <title>编辑角色 - 后台管理系统</title>
      </Helmet>
      <Card title={`编辑角色 (ID: ${params.id})`}>
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label="角色名称"
              name="name"
              rules={[
                { required: true, message: '请输入角色名称!' },
                { max: 50, message: '角色名称不能超过50个字符!' },
              ]}
            >
              <Input placeholder="请输入角色名称" />
            </Form.Item>

            <Form.Item
              label="角色代码"
              name="code"
              rules={[
                { required: true, message: '请输入角色代码!' },
                { pattern: /^[a-z_]+$/, message: '角色代码只能包含小写字母和下划线!' },
              ]}
            >
              <Input placeholder="请输入角色代码，如：admin" disabled />
            </Form.Item>

            <Form.Item
              label="描述"
              name="description"
              rules={[{ max: 200, message: '描述不能超过200个字符!' }]}
            >
              <Input.TextArea rows={3} placeholder="请输入角色描述" showCount maxLength={200} />
            </Form.Item>

            <Form.Item
              label="权限"
              name="permissions"
              rules={[{ required: true, message: '请选择至少一个权限!' }]}
            >
              <CheckboxGroup options={allPermissions} />
            </Form.Item>

            <Form.Item
              label="状态"
              name="status"
              rules={[{ required: true, message: '请选择状态!' }]}
            >
              <Select placeholder="请选择状态">
                <Option value="enabled">启用</Option>
                <Option value="disabled">禁用</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={submitting}>
                提交
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                onClick={() => navigate('/roles')}
                disabled={submitting}
              >
                取消
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
}
