import { useState, useEffect } from 'react';
import { Helmet } from '@modern-js/runtime/head';
import { Table, Button, Space, Popconfirm, message, Tag, Input, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from '@modern-js/runtime/router';
import type { ColumnsType } from 'antd/es/table';
import { http } from '@/utils/http';
import { PageTitle, PageContainer } from '@/components';

const { Search } = Input;
const { Option } = Select;

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: 'active' | 'inactive';
  entryDate: string;
  createTime: string;
}

export default function EmployeesPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [searchStatus, setSearchStatus] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockData: Employee[] = [
        {
          id: '1',
          name: '张三',
          email: 'zhangsan@example.com',
          phone: '13800138001',
          department: '技术部',
          position: '前端工程师',
          status: 'active',
          entryDate: '2023-01-15',
          createTime: '2024-01-01 10:00:00',
        },
        {
          id: '2',
          name: '李四',
          email: 'lisi@example.com',
          phone: '13800138002',
          department: '产品部',
          position: '产品经理',
          status: 'active',
          entryDate: '2023-03-20',
          createTime: '2024-01-02 11:00:00',
        },
        {
          id: '3',
          name: '王五',
          email: 'wangwu@example.com',
          phone: '13800138003',
          department: '技术部',
          position: '后端工程师',
          status: 'inactive',
          entryDate: '2022-11-10',
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
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300));
      setData(data.filter((item) => item.id !== id));
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSearch = () => {
    // 搜索逻辑
    console.log('搜索:', searchName, searchStatus);
  };

  const filteredData = data.filter(item => {
    const matchName = !searchName || item.name.includes(searchName);
    const matchStatus = searchStatus === 'all' || item.status === searchStatus;
    return matchName && matchStatus;
  });

  const columns: ColumnsType<Employee> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 120,
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '在职' : '离职'}
        </Tag>
      ),
    },
    {
      title: '入职日期',
      dataIndex: 'entryDate',
      key: 'entryDate',
      width: 120,
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
            onClick={() => navigate(`/employees/edit/${record.id}`)}
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
        <title>员工管理 - 后台管理系统</title>
      </Helmet>
      <PageTitle
        title="员工管理"
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/employees/create')}
          >
            新增员工
          </Button>
        }
      />

      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Search
          placeholder="搜索姓名"
          allowClear
          style={{ width: 200 }}
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onSearch={handleSearch}
        />
        <Select
          placeholder="选择状态"
          style={{ width: 150 }}
          value={searchStatus}
          onChange={setSearchStatus}
        >
          <Option value="all">全部状态</Option>
          <Option value="active">在职</Option>
          <Option value="inactive">离职</Option>
        </Select>
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
