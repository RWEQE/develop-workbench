import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Drawer, 
  Row, 
  Button, 
  Alert, 
  Form, 
  Input, 
  Divider, 
  Popover, 
  Badge, 
  Space,
  Typography,
  Avatar,
} from '@middle/ui';
import { Table } from  'antd';
const { Text } = Typography;
import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import { SearchForm } from '@/components/SearchForm';
import { AppSelect } from '@/components/AppSelect';
import { CreateBranch } from './CreateBranch';
import { EditAssociatedDemand } from './EditAssociatedDemand';
import { queryAppBranchList } from '@/services/develp-workbench';
import { IApplicaitonList, IBranchList, BranchTypeEnum } from '@/interfaces/develop-workbench';
import { getBranchNameType } from '../utils/index';
import emptyAvatar from '@/assets/avatar.svg'

interface BranchManagementProp {
  visible: boolean;
  appInfo: IApplicaitonList;
  onLoadConsoleInfo: (funcType: 'mergeRequest' | 'tag' | 'branch') => void;
  onCancel: () => void;
}

type branchControlProp = 'createBranch' | 'editAssociatedDemand'

const BranchManagement: React.FC<BranchManagementProp> = ({
  visible,
  appInfo,
  onLoadConsoleInfo,
  onCancel,
}) => {

  const [branchControl, setBranchControl] = useState<branchControlProp>(); // 新建分支/修改关联任务 弹窗控制
  const [branchInfo, setBranchInfo] = useState<IBranchList>(); // 分支名称
  const [branchList, setBranchList] = useState<IBranchList[]>([]); // 分支列表
  const [currentAppInfo, setCurrentAppInfo] = useState<IApplicaitonList>(); // 当前应用信息
  const [pageInfo, setPageInfo] = useState<{page: number; size: number}>({page: 0, size: 10 });
  const [total, setTotal] = useState<number>(0); // total
  const [loading, setLoading] = useState<boolean>(false); // 表格loading
  const [form] = Form.useForm();

  useEffect(() => {
    if(visible && appInfo) {
      loadBranchList();
    }
  }, [visible, appInfo, pageInfo])

  useEffect(() => {
    if(visible && appInfo && !currentAppInfo) {
      setCurrentAppInfo(appInfo)
    }
  }, [visible, appInfo, currentAppInfo])

  // 查询分支列表
  const loadBranchList = useCallback(() => {
    setLoading(true)
    const { appId, branchName } = form.getFieldsValue();
    queryAppBranchList({
      projectId: appInfo.projectId,
      appId,
      page: pageInfo.page,
      size: pageInfo.size,
      filterParams: branchName,
    }, {branchType: 'branch'}
    ).then(
      ({ content, totalElements }) => {
        setBranchList(content);
        setTotal(totalElements);
      }
    ).finally(
      () => setLoading(false)
    )
  }, [appInfo, pageInfo])

  // 关闭弹窗
  const handleClose = useCallback(() => {
    form.resetFields();
    onLoadConsoleInfo('branch');
    setCurrentAppInfo(undefined);
    setBranchInfo(undefined);
    setBranchControl(undefined);
    setBranchList([]);
    setPageInfo({page: 0, size: 10});
    setTotal(0);
    onCancel();
  }, [onLoadConsoleInfo])

  return useMemo(() => {
    return (
      <>
        <Drawer
          visible={visible}
          title='分支管理'
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
            message='分支是将您的开发工作从主线上分离开来，以免影响主线。您可在此查看各应用的分支，创建分支，并将代码拉至本地开发后提交代码。'
            type="info"
          />
          <SearchForm 
            formInstance={form}
            onSearch={loadBranchList}
          >
            <AppSelect
              name='appId'
              label='应用服务'
              required='请选择应用服务'
              initialAppInfo={appInfo}
              formInstance={form}
              onSelect={(value, option) => setCurrentAppInfo(option.data)}
            />
            <Form.Item name='branchName' label='分支名称'>
              <Input placeholder='请输入分支名称' allowClear />
            </Form.Item>
          </SearchForm>
          <Divider style={{marginTop: 0}} />
          <Row justify='space-between'>
            <div>
              <b style={{fontSize: 16}}>分支列表</b>
              <Popover
                placement="bottomLeft"
                overlayInnerStyle={{maxWidth: 500}}
                content={(
                  <>
                    <Badge color="#45A3FC" text="Master" />
                    <div style={{marginLeft: 16}}>
                      即主分支，用于版本持续发布。在开发的整个阶段一直存在，平时不在此分支开发，因此代码比较稳定
                    </div>
                    <Badge color="#F953BA" text="Feature" />
                    <div style={{marginLeft: 16}}>
                      即特性分支，用于日常开发时切出分支进行单功能开发。基于develop分支创建，结束分支时合井至develop分支
                    </div>
                    <Badge color="#FFB100" text="Bugfix" />
                    <div style={{marginLeft: 16}}>
                      即漏洞修补分支，通常用于对发布分支进行错误修复
                    </div>
                    <Badge color="#02BF96" text="Release" />
                    <div style={{marginLeft: 16}}>
                      即发布分支，用于产品发布、产品迭代。基于develop分支创建，结束分支时合井到develop分 支和master分支
                    </div>
                    <Badge color="#F44336" text="Hotfix" />
                    <div style={{marginLeft: 16}}>
                      即热修分支，用于产品发布后修复缺陷。基于master分支创建，结束分支时合井到master分 支和develop分支
                    </div>
                    <Badge color="#AF4CFF" text="Custom" />
                    <div style={{marginLeft: 16}}>
                      即自定义分支
                    </div>
                  </>
                )}
                trigger="click"
              >
                <Button type='link'>查看详情</Button>
              </Popover>
            </div>
            <div>
              <Button type='link' onClick={loadBranchList}>
                刷新
              </Button>
              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={() => setBranchControl('createBranch')}
              >
                新增
              </Button>
            </div>
          </Row>
          <br />
          <Table<IBranchList>
            loading={loading}
            dataSource={branchList}
            columns={[
              {
                title: '分支名称',
                dataIndex: 'branchName',
                width: 250,
                render: (_) => {
                  const branchNameType = getBranchNameType(_)
                  return (
                    <span style={{display: 'flex'}}>
                      <Avatar
                        style={{ 
                          color: BranchTypeEnum[branchNameType].color, 
                          backgroundColor: BranchTypeEnum[branchNameType].backgroundColor,
                          minWidth: 24,
                        }}
                        size="small"
                      >
                        {BranchTypeEnum[branchNameType].avatar}
                      </Avatar>
                      &ensp;
                      <Text ellipsis={{ tooltip: _ }}>
                        {_}
                      </Text>
                    </span>
                  )
                }
              },
              {
                title: '最近提交信息',
                dataIndex: 'commitContent',
                width: 150,
                render: (_, record) => (
                  <Space 
                    style={{width: '100%'}}
                    direction='vertical' 
                    size={2}
                  >
                    <Text ellipsis={{ tooltip: record.sha }}>
                      <a href={record.commitUrl} target='_blank'>
                        {record.sha}
                      </a>
                    </Text>
                    <Text ellipsis={{ tooltip: record.commitContent }}>
                      {record.commitContent}
                    </Text>
                  </Space>
                )
              },
              {
                title: '关联任务',
                dataIndex: 'demandAllPath',
                width: 200,
                render: (_: string[]) => (
                  <Space 
                    style={{width: '100%'}}
                    direction='vertical' 
                    size={2}
                  >
                    {
                      _?.map(demand => (
                        <Text key={demand} ellipsis={{ tooltip: demand }}>
                          {demand}
                        </Text>
                      ))
                    }
                  </Space>
                )
              },
              {
                title: '最近提交时间',
                dataIndex: 'commitDate',
                width: 200,
              },
              {
                title: '最近提交人',
                dataIndex: 'commitUserName',
                width: 200,
                render: (_, record) => (
                  <span>
                    {_ && <Avatar src={record.commitUserUrl || emptyAvatar} size="small" />}
                    &ensp;{_}
                  </span>
                )
              },
              {
                title: '创建人',
                dataIndex: 'createUserRealName',
                width: 200,
                render: (_, record) => (
                  <span>
                    {_ && <Avatar src={record.createUserUrl || emptyAvatar} size="small" />}
                    &ensp;{_}
                  </span>
                )
              },
              {
                title: '操作',
                dataIndex: 'action',
                width: 120,
                fixed: 'right',
                render: (_, record) => (
                  record.branchName !== 'master' && (
                    <Space
                      style={{width: '100%'}}
                      direction='vertical' 
                      size={2}
                    >
                      <a 
                        onClick={() => {
                          setBranchControl('editAssociatedDemand');
                          setBranchInfo(record)
                        }}
                      >
                        修改关联任务
                      </a>
                      <a 
                        href={record.commitUrl && `${record.commitUrl.split('/commit')[0]}/merge_requests/new?change_branches=true&merge_request[source_branch]=${record.branchName}&merge_request[target_branch]=master`} 
                        target="_blank" 
                        rel="nofollow me noopener noreferrer"
                      >
                        创建合并请求
                      </a>
                    </Space>
                  )
                )
              },
            ]}
            scroll={{
              x: 'min-content'
            }}
            pagination={{
              showQuickJumper: true,
              showSizeChanger: true,
              current: pageInfo.page + 1,
              pageSize: pageInfo.size,
              total: total,
              showTotal: (total) => `共 ${total} 条记录`,
              onChange: (page, size) => setPageInfo({page: page - 1, size}),
            }}
          />
        </Drawer>
        <CreateBranch
          visible={branchControl == 'createBranch'}
          appInfo={currentAppInfo!}
          onAppInfoReload={loadBranchList}
          onCancel={() => setBranchControl(undefined)}
        />
        <EditAssociatedDemand
          visible={branchControl == 'editAssociatedDemand'}
          branchInfo={branchInfo!}
          appInfo={currentAppInfo!}
          onAppInfoReload={loadBranchList}
          onCancel={() => setBranchControl(undefined)}
        />
      </>
    )
  }, [visible, appInfo, branchControl, branchInfo, branchList, pageInfo, total, loading, onLoadConsoleInfo])
}

export { BranchManagement };