import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Drawer, 
  Row, 
  Button, 
  Alert, 
  Form, 
  ConfigProvider, 
  Input, 
  Divider, 
  Typography,
  Space,
} from '@middle/ui';
import { Empty, Table } from  'antd';
const { Text } = Typography;
import { PlusOutlined } from '@ant-design/icons';
import { SearchForm } from '@/components/SearchForm';
import { AppSelect } from '@/components/AppSelect';
import { CreateTag } from './CreateTag';
import { queryAppTagList } from '@/services/develp-workbench';
import { IApplicaitonList, ITagList, TagControlProp } from '@/interfaces/develop-workbench';

interface TagManagementProp {
  visible: boolean;
  appInfo: IApplicaitonList;
  onLoadConsoleInfo: (funcType: 'mergeRequest' | 'tag' | 'branch') => void;
  onCancel: () => void;
}

const TagManagement: React.FC<TagManagementProp> = ({
  visible,
  appInfo,
  onLoadConsoleInfo,
  onCancel,
}) => {

  const [tagControl, setTagControl] = useState<TagControlProp>({controlType: null}); // 控制 新建/编辑 标记弹窗
  const [tagList, setTagList] = useState<ITagList[]>([]); // 标记列表
  const [currentAppInfo, setCurrentAppInfo] = useState<IApplicaitonList>(); // 当前应用信息
  const [pageInfo, setPageInfo] = useState<{page: number; size: number}>({page: 0, size: 10 });
  const [total, setTotal] = useState<number>(0); // total
  const [loading, setLoading] = useState<boolean>(false); // 表格loading
  const [form] = Form.useForm();

  useEffect(() => {
    if(visible && appInfo) {
      loadTagList();
    }
  }, [visible, appInfo, pageInfo])

  useEffect(() => {
    if(visible && appInfo && !currentAppInfo) {
      setCurrentAppInfo(appInfo)
    }
  }, [visible, appInfo, currentAppInfo])

  // 查询标记列表
  const loadTagList = useCallback(() => {
    setLoading(true)
    const { appId, tagName } = form.getFieldsValue();
    queryAppTagList({
      projectId: appInfo.projectId,
      appId: appId,
      page: pageInfo.page,
      size: pageInfo.size,
      filterParams: tagName || '',
    }).then(
      ({ content, totalElements }) => {
        setTagList(content);
        setTotal(totalElements);
      }
    ).finally(
      () => setLoading(false)
    )
  }, [appInfo, pageInfo])

  // 关闭弹窗
  const handleClose = useCallback(() => {
    form.resetFields();
    onLoadConsoleInfo('tag');
    setTagControl({controlType: null});
    setTagList([]);
    setCurrentAppInfo(undefined);
    setPageInfo({page: 0, size: 10});
    setTotal(0);
    onCancel();
  }, [onLoadConsoleInfo])  

  return useMemo(() => {
    return (
      <>
        <Drawer
          visible={visible}
          title='标记管理'
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
            message='标记是用于标识某一时间点形成的稳定可发布的代码版本。您可在此查看各应用的所有标记及相关提交信息，还可以基于某一分支创建标记。'
            type="info"
          />
          <SearchForm 
            formInstance={form}
            onSearch={loadTagList}
          >
            <AppSelect
              name='appId'
              label='应用服务'
              required='请选择应用服务'
              initialAppInfo={appInfo}
              formInstance={form}
              onSelect={(value, option) => setCurrentAppInfo(option.data)}
            />
            <Form.Item 
              name='tagName' 
              label='标记名称'
            >
              <Input placeholder='请输入标记名称' />
            </Form.Item>
          </SearchForm>
          <Divider style={{marginTop: 0}} />
          <Row justify='space-between'>
            <b style={{fontSize: 16}}>标记列表</b>
            <div>
              <Button type='link' onClick={loadTagList}>
                刷新
              </Button>
              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={() => setTagControl({
                  controlType: 'create'
                })}
              >
                新增
              </Button>
            </div>
          </Row>
          <br />
          <ConfigProvider 
            renderEmpty={() => (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}>
                暂无任何标记，您可在此页面基于某一分支创建标记。
              </Empty>
            )}
          >
            <Table<ITagList>
              loading={loading}
              dataSource={tagList}
              columns={[
                {
                  title: '标记名称',
                  dataIndex: 'tagName',
                  width: 200,
                },
                {
                  title: '最近提交信息',
                  dataIndex: 'commitContent',
                  width: 200,
                  render: (_, record) => (
                    <Space 
                      style={{width: '100%'}}
                      direction='vertical' 
                      size={2}
                    >
                      <Text ellipsis={{ tooltip: record.commit?.id }}>
                        <a href={record.commit?.url} target='_blank'>
                          {record.commit?.id}
                        </a>
                      </Text>
                      <Text ellipsis={{ tooltip: record.commit.message }}>
                        {record.commit.message}
                      </Text>
                    </Space>
                  )
                },
                {
                  title: '发布日志',
                  dataIndex: 'releaseLog',
                  width: 200,
                  render: (_, record) => (
                    <Text ellipsis={{ tooltip: record?.release?.description }}>
                      {record?.release?.description}
                    </Text>
                  )
                },
                {
                  title: '最近提交时间',
                  dataIndex: 'optAt',
                  width: 200,
                  render: (_, record) => record.commit.committedDate
                },
                {
                  title: '最近提交人',
                  dataIndex: 'createBy',
                  width: 200,
                  render: (_, record) => record.commit.committerName
                },
                {
                  title: '操作',
                  dataIndex: 'action',
                  width: 120,
                  fixed: 'right',
                  render: (_, record) => (
                    <a onClick={() => setTagControl({
                      controlType: 'edit',
                      tagInfo: record,
                    })}>
                      修改标记内容
                    </a>
                  )
                },
              ]}
              scroll={{x: 'min-content'}}
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
          </ConfigProvider>
        </Drawer>
        <CreateTag
          visible={!!tagControl.controlType}
          tagControl={tagControl}
          appInfo={currentAppInfo!}
          onAppInfoReload={loadTagList}
          onCancel={() => setTagControl({controlType: null})}
        />
      </>
    )
  }, [visible, appInfo, currentAppInfo, tagControl, tagList, pageInfo, total, loading, onLoadConsoleInfo])
}

export { TagManagement };