import { Helmet } from '@modern-js/runtime/head';
import { Result, Button, Space, Card, List, Divider } from 'antd';
import { HomeOutlined, ReloadOutlined, BugOutlined, SolutionOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from '@modern-js/runtime/router';

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoList = () => {
    navigate('/list');
  };

  // 可能访问的页面列表
  const quickLinks = [
    { title: '首页', path: '/', description: '查看系统概览' },
    { title: '列表页', path: '/list', description: '管理数据列表' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Helmet>
        <title>404 - 页面不存在</title>
      </Helmet>

      <Result
        status="404"
        title="404"
        subTitle={
          <div>
            <p>抱歉，您访问的页面不存在。</p>
            <p style={{ fontSize: '14px', color: '#999', marginTop: '8px' }}>
              访问路径：<code>{location.pathname}</code>
            </p>
          </div>
        }
        extra={
          <Space wrap>
            <Button type="primary" icon={<HomeOutlined />} onClick={handleGoHome} size="large">
              返回首页
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleGoBack} size="large">
              返回上一页
            </Button>
          </Space>
        }
      />

      <Card
        title={<span><SolutionOutlined /> 快速导航</span>}
        style={{ marginTop: '24px', maxWidth: '600px', margin: '24px auto' }}
      >
        <List
          dataSource={quickLinks}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="link" onClick={() => navigate(item.path)}>
                  前往
                </Button>
              ]}
            >
              <List.Item.Meta
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Card>

      <Card
        title={<span><BugOutlined /> 可能的原因</span>}
        style={{ maxWidth: '600px', margin: '24px auto' }}
      >
        <List
          size="small"
          dataSource={[
            '页面链接已过期或被删除',
            '输入的 URL 地址有误',
            '页面正在维护中',
            '您没有访问权限',
          ]}
          renderItem={(item) => (
            <List.Item>
              <span>• {item}</span>
            </List.Item>
          )}
        />
      </Card>

      <div style={{ textAlign: 'center', marginTop: '32px', color: '#999' }}>
        <p>如果问题持续存在，请联系系统管理员</p>
      </div>
    </div>
  );
}
