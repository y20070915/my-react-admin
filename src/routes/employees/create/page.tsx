import { Helmet } from '@modern-js/runtime/head';
import { Form, Input, Button, Card, Select, message, DatePicker } from 'antd';
import { useNavigate } from '@modern-js/runtime/router';
import { useState } from 'react';
import { http } from '@/utils/http';
import dayjs from 'dayjs';

const { Option } = Select;

interface FormData {
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: 'active' | 'inactive';
  entryDate: string;
}

export default function CreateEmployeePage() {
  const navigate = useNavigate();
  const [form] = Form.useForm<FormData>();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setSubmitting(true);

      // 格式化日期
      const formattedValues = {
        ...values,
        entryDate: values.entryDate ? values.entryDate.format('YYYY-MM-DD') : '',
      };

      // 模拟API调用
      console.log('提交数据:', formattedValues);
      await new Promise(resolve => setTimeout(resolve, 800));

      message.success('创建成功');
      navigate('/employees');
    } catch (error: any) {
      message.error(error.message || '创建失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Helmet>
        <title>新增员工 - 后台管理系统</title>
      </Helmet>
      <Card title="新增员工">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label="姓名"
            name="name"
            rules={[
              { required: true, message: '请输入姓名!' },
              { max: 20, message: '姓名不能超过20个字符!' },
            ]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱!' },
              { type: 'email', message: '请输入正确的邮箱格式!' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            label="电话"
            name="phone"
            rules={[
              { required: true, message: '请输入电话!' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码!' },
            ]}
          >
            <Input placeholder="请输入手机号码" />
          </Form.Item>

          <Form.Item
            label="部门"
            name="department"
            rules={[{ required: true, message: '请选择部门!' }]}
          >
            <Select placeholder="请选择部门">
              <Option value="技术部">技术部</Option>
              <Option value="产品部">产品部</Option>
              <Option value="设计部">设计部</Option>
              <Option value="运营部">运营部</Option>
              <Option value="人事部">人事部</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="职位"
            name="position"
            rules={[
              { required: true, message: '请输入职位!' },
              { max: 50, message: '职位不能超过50个字符!' },
            ]}
          >
            <Input placeholder="请输入职位" />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态!' }]}
            initialValue="active"
          >
            <Select placeholder="请选择状态">
              <Option value="active">在职</Option>
              <Option value="inactive">离职</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="入职日期"
            name="entryDate"
            rules={[{ required: true, message: '请选择入职日期!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting}>
              提交
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => navigate('/employees')}
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
