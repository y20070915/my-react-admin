import { Helmet } from '@modern-js/runtime/head';
import { Form, Input, Button, Card, Select, message, Checkbox } from 'antd';
import { useNavigate } from '@modern-js/runtime/router';
import { useState } from 'react';
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

export default function CreateRolePage() {
  const navigate = useNavigate();
  const [form] = Form.useForm<FormData>();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: FormData) => {
    try {
      setSubmitting(true);
      console.log('提交数据:', values);
      await new Promise(resolve => setTimeout(resolve, 800));

      message.success('创建成功');
      navigate('/roles');
    } catch (error: any) {
      message.error(error.message || '创建失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Helmet>
        <title>新增角色 - 后台管理系统</title>
      </Helmet>
      <Card title="新增角色">
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
            <Input placeholder="请输入角色代码，如：admin" />
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
            initialValue="enabled"
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
      </Card>
    </div>
  );
}
