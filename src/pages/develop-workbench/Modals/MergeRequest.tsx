import React, { useState, useMemo, useCallback,  useEffect } from 'react';
import { Drawer, Row, Button, Alert, Tabs, Space, Typography } from '@middle/ui';
const { TabPane } = Tabs;
const { Text } = Typography;
import { Table, Form } from 'antd';
import { PlusOutlined, BranchesOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { SearchForm } from '@/components/SearchForm';
import { AppSelect } from '@/components/AppSelect';
import { queryAppMergeRequest, queryAppGitUrl } from '@/services/develp-workbench';
import { IApplicaitonList, IMergeRequestProp, IMergeRequestList } from '@/interfaces/develop-workbench';

interface MergeRequestProp {
  visible: boolean;
  appInfo: IApplicaitonList;
  onLoadConsoleInfo: (funcType: 'mergeRequest' | 'tag' | 'branch') => void;
  onCancel: () => void;
}

const MergeRequest: React.FC<MergeRequestProp> = ({
  visible,
  appInfo,
  onLoadConsoleInfo,
  onCancel,
}) => {

  const [activeKey, setActiveKey] = useState<'opened' | 'merged' |  'closed' | 'all'>('opened'); // tab页key
  const [mergeRequestList, setMergeRequestList] = useState<IMergeRequestProp>(); // 分支列表
  const [gitUrl, setGitUrl] = useState<string>();
  const [pageInfo, setPageInfo] = useState<{page: number; size: number}>({page: 0, size: 10 });
  const [loading, setLoading] = useState<boolean>(false); // 表格loading
  const [form] = Form.useForm();
  const curAppId = Form.useWatch('appId', form);

  useEffect(() => {
    if(visible && appInfo && curAppId) {
      loadAppGitUrl();
    }
  }, [visible, appInfo, curAppId])

  useEffect(() => {
    if(visible && appInfo) {
      loadMergeRequestList();
    }
  }, [visible, appInfo, pageInfo, activeKey])

  // 查询分支列表
  const loadMergeRequestList = useCallback(() => {
    setLoading(true)
    const { projectId, appId } = form.getFieldsValue();
    queryAppMergeRequest({
      projectId: projectId,
      applicationId: appId,
      page: pageInfo.page,
      size: pageInfo.size,
      state: activeKey !== 'all' ? activeKey : '',
    }).then(
      (res) => {
        setMergeRequestList(res);
      }
    ).finally(
      () => setLoading(false)
    )
  }, [appInfo, pageInfo, activeKey])

  // 获取应用的 git Url
  const loadAppGitUrl = useCallback(() => {
    const { projectId, appId } = form.getFieldsValue();
    queryAppGitUrl(projectId, appId).then(
      (res) => {
        setGitUrl(res)
      }
    )
  }, [appInfo])

  // 不同tab页下 有不同的列
  const columns = useMemo(() => {
    const initColumns = [
      {
        title: 'id',
        dataIndex: 'iid',
        width: 100,
        render: (_: string) => _ ? `!${_}` : ''
      },
      {
        title: '名称',
        dataIndex: 'title',
        width: 350,
        render: (_: string) => (
          <Text
            ellipsis={{ tooltip: _ }}
          >
            {_}
          </Text>
        )
      },
      {
        title: '分支',
        dataIndex: 'sourceBranch',
        width: 470,
        render: (_: string, record: IMergeRequestList) => (
          <Space size={8}>
            <div style={{wordBreak: 'break-all'}}>
              <BranchesOutlined />&ensp;
              {record.sourceBranch}
            </div>
            <ArrowRightOutlined />
            <div style={{wordBreak: 'break-all'}}>
              <BranchesOutlined />&ensp;
              {record.targetBranch}
            </div>
          </Space>
        )
      },
      {
        title: '创建',
        dataIndex: 'createdAt',
        width: 200,
        align: 'center',
        render: (_: string, record: IMergeRequestList) => (
          <div>
            <div>
              {record.author?.name}
            </div>
            {_}
          </div>
        )
      },
      {
        title: '新增提交',
        dataIndex: 'commits',
        width: 120,
        render: (_: Array<any>) =>  (_?.length || 0) + ' commits'
      },
      {
        title: '最近更新',
        dataIndex: 'updatedAt',
        width: 200,
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 100,
        fixed: 'right',
        render: (_: null, record: IMergeRequestList) => (
          <a href={`${gitUrl}/merge_requests/${record.iid}`} target='_blank'>
            查看详情
          </a>
        )
      }
    ] as any
    if(activeKey == 'opened') {
      initColumns.splice(6, 0, {
        title: '审核人',
        dataIndex: 'branch',
        width: 200,
      })
    } else if(activeKey == 'all') {
      initColumns.splice(3, 0, {
        title: '合并状态',
        dataIndex: 'state',
        width: 120,
      })
    }
    return initColumns;
  }, [activeKey, gitUrl])

  // 关闭弹窗
  const handleClose = useCallback(() => {
    form.resetFields();
    onLoadConsoleInfo('mergeRequest');
    setActiveKey('opened');
    setMergeRequestList(undefined);
    setGitUrl(undefined);
    setPageInfo({page: 0, size: 10});
    onCancel();
  }, [onLoadConsoleInfo])

  return useMemo(() => {
    return (
      <Drawer
        visible={visible}
        title='合并请求'
        width={1080}
        onClose={handleClose}
        footer={(
          <Row justify='space-between'>
            <Button onClick={handleClose}>取消</Button>
            <Button type='primary' onClick={handleClose}>提交</Button>
          </Row>
        )}
      >
        <Alert
          message='合并请求是将某一分支的代码合并至另一分支的操作。您可在此查看各应用的合并请求，及创建合并请求。'
          type='info'
        />
        <br />
        <Tabs
          activeKey={activeKey}
          tabBarExtraContent={(
            <Button
              type='primary'
              icon={<PlusOutlined />}
              href={`${gitUrl}/merge_requests/new`}
              target='_blank'
            >
              新建合并请求
            </Button>
          )}
          tabBarStyle={{marginBottom: 0}}
          onChange={(value) => setActiveKey(value)}
          >
          <TabPane tab={`开放(${mergeRequestList?.openCount || 0})`} key="opened" />
          <TabPane tab={`已合并(${mergeRequestList?.mergeCount || 0})`} key="merged" />
          <TabPane tab={`关闭(${mergeRequestList?.closeCount || 0})`} key="closed" />
          <TabPane tab={`全部(${mergeRequestList?.totalCount || 0})`} key="all" />
        </Tabs>
        <SearchForm
          formInstance={form}
          onSearch={loadMergeRequestList}
        >
          <AppSelect
            name='appId'
            label='应用服务'
            required='请选择应用服务'
            initialAppInfo={appInfo}
            formInstance={form}
          />
        </SearchForm>
        <Row justify='space-between'>
          <b>合并请求列表</b>
          <Button type='link' onClick={loadMergeRequestList}>
            刷新
          </Button>
        </Row>
        <Table<IMergeRequestList>
          loading={loading}
          rowKey={'id'}
          dataSource={mergeRequestList?.pageResult.content}
          columns={columns}
          scroll={{
            x: 'min-content'
          }}
          pagination={{
            showQuickJumper: true,
            showSizeChanger: true,
            current: pageInfo.page + 1,
            pageSize: pageInfo.size,
            total: mergeRequestList?.pageResult.totalElements,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, size) => setPageInfo({page: page - 1, size}),
          }}
        />
      </Drawer>
    )
  }, [visible, appInfo, activeKey, mergeRequestList, gitUrl, pageInfo, loading, onLoadConsoleInfo])
}

export { MergeRequest };