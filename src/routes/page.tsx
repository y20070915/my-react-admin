import { Helmet } from '@modern-js/runtime/head';
import { Card, Row, Col, Statistic, Button, Space } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ShoppingOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useNavigate } from '@modern-js/runtime/router';
import { PageTitle, PageContainer } from '@/components';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <Helmet>
        <title>首页 - 后台管理系统</title>
      </Helmet>
      <PageTitle
        title="欢迎使用后台管理系统"
        size="large"
        actions={
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => navigate('/list')}
          >
            文件上传管理
          </Button>
        }
      />
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={1128}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="订单总数"
              value={2893}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="营业额"
              value={98765}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="商品数量"
              value={1234}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 文件上传功能介绍 */}
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="🚀 文件上传功能" extra={<Button type="link" onClick={() => navigate('/list')}>立即体验</Button>}>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📁</div>
                  <h3>拖拽上传</h3>
                  <p style={{ color: '#666' }}>支持拖拽文件到指定区域进行上传，操作简单直观</p>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
                  <h3>文件夹上传</h3>
                  <p style={{ color: '#666' }}>支持拖拽整个文件夹，保持文件夹结构</p>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
                  <h3>大文件分片上传</h3>
                  <p style={{ color: '#666' }}>使用WebWorker进行分片上传，避免阻塞主线程</p>
                </div>
              </Col>
            </Row>
            <div style={{ marginTop: 20, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
              <h4 style={{ marginBottom: 12 }}>✨ 主要特性：</h4>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>支持多种文件格式：图片、PDF、Word、Excel、文本文件等</li>
                <li>实时上传进度显示，支持分片进度管理</li>
                <li>文件大小和类型验证，确保上传安全</li>
                <li>响应式设计，适配移动端和桌面端</li>
                <li>文件预览功能，支持文件信息查看</li>
              </ul>
            </div>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
}
