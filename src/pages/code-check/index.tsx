import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { orderNumber } from '@/utils/common';
import AddCheck from './components/AddCheck';
import ShowCheck from './components/ShowCheck';
import { queryReviews, queryUsers } from '@/services/code-check';
import moment from 'moment';
import { useRef } from 'react';

type CodeCheckItemInfo = CodeCheckAPI.ItemInfo;

export default () => {
  const actionRef = useRef<ActionType>();

  // 刷新表格
  const refreshTable = () => {
    actionRef?.current?.reload();
  };

  const columns: ProColumns<CodeCheckItemInfo>[] = [
    {
      title: 'CR号',
      order: orderNumber(1),
      dataIndex: 'crCode',
      render: (_, record) => (
        <a target="_blank" href={record.fisheyeUrl} rel="noreferrer">
          {_}
        </a>
      ),
    },
    {
      title: '任务名称',
      order: orderNumber(3),
      dataIndex: 'issueName',
    },
    {
      title: '产品项目',
      order: orderNumber(2),
      dataIndex: 'projectName',
    },
    {
      title: '创建人',
      order: orderNumber(6),
      render: (_, record) => `${_}#${record.creatorName}`,
      dataIndex: 'creatorDisplayName',
      dependencies: ['creatorDisplayName'],
      fieldProps: { showSearch: true, filterOption: false },
      request: async (params) => {
        try {
          const { content = [] } = await queryUsers(params?.keyWords);
          return content.map((item: { realName: string; loginName: string }) => ({
            label: item.realName,
            value: item.loginName,
          }));
        } catch (error) {
          return [];
        }
      },
    },
    {
      title: '审核人',
      order: orderNumber(5),
      render: (_, record) => `${_}#${record.moderatorName}`,
      dataIndex: 'moderatorDisplayName',
      dependencies: ['moderatorDisplayName'],
      fieldProps: { showSearch: true, filterOption: false },
      request: async (params) => {
        try {
          const { content = [] } = await queryUsers(params?.keyWords);
          return content.map((item: { realName: string; loginName: string }) => ({
            label: item.realName,
            value: item.loginName,
          }));
        } catch (error) {
          return [];
        }
      },
    },
    {
      title: '审核状态',
      order: orderNumber(4),
      disable: true,
      dataIndex: 'crStatus',
      valueType: 'select',
      fieldProps: { mode: 'multiple' },
      valueEnum: {
        Draft: { text: '未审核', status: 'Default' },
        Success: { text: '审核成功', status: 'Success' },
        Review: { text: '审核中', status: 'Processing' },
        Dead: { text: '审核失败', status: 'Error' },
      },
    },
    {
      title: '创建时间',
      key: 'showTime',
      dataIndex: 'creationDate',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createDateRange',
      order: orderNumber(7),
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => ({
          createStartTime: Number(moment(value[0]).startOf('day').format('X')),
          createEndTime: Number(moment(value[1]).endOf('day').format('X')),
        }),
      },
    },
    {
      title: '最后操作时间',
      dataIndex: 'lastUpdateDate',
      hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      render: (text, record) => [
        // 查看
        <ShowCheck key="show" tag="show" checkData={record} />,
        // 修改
        <ShowCheck key="edit" tag="edit" checkData={record} refreshTable={refreshTable} />,
        // 去审核
        <a key="editable" target="_blank" href={record.fisheyeUrl} rel="noreferrer">
          去审核
        </a>,
      ],
    },
  ];

  return (
    <ProTable<CodeCheckItemInfo>
      actionRef={actionRef}
      scroll={{ x: 'max-content' }}
      columns={columns}
      request={async (params) => {
        console.log('params', params);
        const { current = 1, pageSize = 10, ...resetParams } = params;
        const { projectName, issueName, moderatorDisplayName, creatorDisplayName } = resetParams;
        const { content = [], totalElements = 0 } = await queryReviews({
          page: { size: pageSize, startPage: current },
          params: {
            ...resetParams,
            projectStr: projectName,
            issueStr: issueName,
            moderatorName: moderatorDisplayName,
            creatorName: creatorDisplayName,
          },
        });
        return { success: true, data: content, total: totalElements };
      }}
      columnsState={{ persistenceKey: 'code-check-table', persistenceType: 'localStorage' }}
      rowKey="id"
      pagination={{ defaultPageSize: 10 }}
      dateFormatter="string"
      headerTitle="代码审核列表"
      defaultSize="large"
      toolBarRender={() => [<AddCheck key="addCheck" refreshTable={refreshTable} />]}
    />
  );
};
