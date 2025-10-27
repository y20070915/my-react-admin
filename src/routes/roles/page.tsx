import { useState, useEffect } from 'react';
import { Helmet } from '@modern-js/runtime/head';
import { Table, Button, Space, Popconfirm, message, Tag, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from '@modern-js/runtime/router';
import type { ColumnsType } from 'antd/es/table';
import { http } from '@/utils/http';
import { PageTitle, PageContainer } from '@/components';

const { Search } = Input;

interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  permissions: string[];
  status: 'enabled' | 'disabled';
  createTime: string;
}

export default function RolesPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockData: Role[] = [
        {
          id: '1',
          name: '管理员',
          code: 'admin',
          description: '拥有所有权限的管理员角色',
          permissions: ['user:create', 'user:read', 'user:update', 'user:delete', 'role:manage'],
          status: 'enabled',
          createTime: '2024-01-01 10:00:00',
        },
        {
          id: '2',
          name: '普通用户',
          code: 'user',
          description: '普通用户权限',
          permissions: ['user:read'],
          status: 'enabled',
          createTime: '2024-01-02 11:00:00',
        },
        {
          id: '3',
          name: '审核员',
          code: 'auditor',
          description: '数据审核权限',
          permissions: ['user:read', 'user:update'],
          status: 'enabled',
          createTime: '2024-01-03 12:00:00',
        },
      ];

      setData(mockData);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setData(data.filter((item) => item.id !== id));
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSearch = () => {
    console.log('搜索:', searchName);
  };

  const filteredData = data.filter(item => {
    return !searchName || item.name.includes(searchName) || item.code.includes(searchName);
  });

  const columns: ColumnsType<Role> = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '角色代码',
      dataIndex: 'code',
      key: 'code',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      ellipsis: true,
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      key: 'permissions',
      width: 300,
      render: (permissions: string[]) => (
        <Space wrap>
          {permissions.slice(0, 3).map((perm, index) => (
            <Tag key={index} color="blue">{perm}</Tag>
          ))}
          {permissions.length > 3 && <Tag>+{permissions.length - 3}</Tag>}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'enabled' ? 'green' : 'red'}>
          {status === 'enabled' ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/roles/edit/${record.id}`)}
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
        <title>角色管理 - 后台管理系统</title>
      </Helmet>
      <PageTitle
        title="角色管理"
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/roles/create')}
          >
            新增角色
          </Button>
        }
      />

      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Search
          placeholder="搜索角色名称或代码"
          allowClear
          style={{ width: 300 }}
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onSearch={handleSearch}
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
          查询
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1200 }}
        pagination={{
          total: filteredData.length,
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />
    </PageContainer>
  );
}
