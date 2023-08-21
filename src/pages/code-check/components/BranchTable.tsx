import { Button, Popconfirm, Table } from 'antd';
import type { ColumnType } from 'antd/lib/table';

type Props = {
  dataSource: any[];
  showOptions?: boolean;
  onDelete?: (record: any) => void;
};
export default ({ dataSource, showOptions, onDelete }: Props) => {
  const branchColumns: ColumnType<any>[] = [
    {
      title: '产品项目',
      dataIndex: 'projectName',
    },
    {
      title: '项目编码',
      dataIndex: 'projectCode',
    },
    {
      title: '应用名称',
      dataIndex: 'appName',
    },
    {
      title: '应用编码',
      dataIndex: 'appCode',
    },
    {
      title: '分支名称',
      dataIndex: 'branchName',
    },
    {
      title: '分支来源',
      dataIndex: 'originBranch',
    },
  ];
  if (showOptions) {
    branchColumns.push({
      title: '操作',
      key: 'option',
      fixed: 'right',
      render: (record: any) => {
        return (
          <Popconfirm
            title="确定删除？"
            onConfirm={() => {
              if (onDelete) onDelete(record);
            }}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link">删除</Button>
          </Popconfirm>
        );
      },
    });
  }

  return (
    <Table
      columns={branchColumns}
      dataSource={dataSource}
      rowKey="id"
      scroll={{ x: 'max-content' }}
      pagination={false}
    />
  );
};
