import { useState, useEffect } from 'react';
import { Helmet } from '@modern-js/runtime/head';
import { Table, Button, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from '@modern-js/runtime/router';
import type { ColumnsType } from 'antd/es/table';
import { ContextMenu } from '@/components';
import { PageTitle, PageContainer } from '@/components';

interface DataType {
  id: string;
  name: string;
  description: string;
  status: string;
  createTime: string;
}

export default function ListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({ visible: false, x: 0, y: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  // 监听右键点击事件
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
      });
    };

    // 添加右键监听（可以指定具体区域，这里监听整个页面）
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // 模拟数据
    setTimeout(() => {
      setData([
        {
          id: '1',
          name: '商品A',
          description: '这是商品A的描述',
          status: '启用',
          createTime: '2024-01-01 10:00:00',
        },
        {
          id: '2',
          name: '商品B',
          description: '这是商品B的描述',
          status: '启用',
          createTime: '2024-01-02 11:00:00',
        },
        {
          id: '3',
          name: '商品C',
          description: '这是商品C的描述',
          status: '禁用',
          createTime: '2024-01-03 12:00:00',
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const handleDelete = (id: string) => {
    setData(data.filter((item) => item.id !== id));
    message.success('删除成功');
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleCloseContextMenu = () => {
    setContextMenu({ ...contextMenu, visible: false });
  };

  const columns: ColumnsType<DataType> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/list/edit/${record.id}`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <Helmet>
        <title>列表页 - 后台管理系统</title>
      </Helmet>
      <PageTitle
        title="数据列表"
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/list/create')}
          >
            新建
          </Button>
        }
      />
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
      />
      <ContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={handleCloseContextMenu}
        onRefresh={handleRefresh}
      />
    </PageContainer>
  );
}
