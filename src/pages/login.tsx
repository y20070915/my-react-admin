import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from '@modern-js/runtime/router';
import { auth } from '@/utils/auth';
import { http } from '@/utils/http';
import './login.css';

interface LoginForm {
  username: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();

  const onFinish = async (values: LoginForm) => {
    try {
      // 模拟登录API
      const response = await http.post('/auth/login', values);

      // 实际项目中应该从响应中获取token和用户信息
      const mockToken = 'mock_token_' + Date.now();
      const mockUserInfo = {
        id: '1',
        username: values.username,
        role: 'admin',
        permissions: ['read', 'write'],
      };

      auth.setToken(mockToken);
      auth.setUserInfo(mockUserInfo);

      message.success('登录成功');
      navigate('/');
    } catch (error) {
      message.error('登录失败，请检查用户名和密码');
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card" title="后台管理系统">
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form.Item>
        </Form>
        <div className="login-tip">
          <p>测试账号：admin / admin123</p>
        </div>
      </Card>
    </div>
  );
}
