import React, { useState, useEffect, useCallback } from 'react';
import { Drawer, Row, Col, Button, Alert, Tabs, Form, Select, Input, message, Spin } from '@middle/ui';
const { TabPane } = Tabs;
import { Table } from 'antd';
import { BarTitle } from '@/components/BarTitle';
import CodeMirror from '@/components/CodeMirror';
import { queryCiContent, queryCiContentLog, createCiContent, updateCiContent } from '@/services/develp-workbench';
import { IApplicaitonList, AppBuildScriptDetail, IScriptLog } from '@/interfaces/develop-workbench';

interface AppBuildScriptProp {
  visible: boolean;
  appInfo: IApplicaitonList;
  onCancel: () => void;
}

const AppBuildScript: React.FC<AppBuildScriptProp> = ({
  visible,
  appInfo,
  onCancel,
}) => {

  const [activeKey, setActiveKey] = useState<'build-script' | 'change-history'>('build-script');
  const [buildStatus, setBuildStatus] = useState<'readOnly' | 'create' | 'edit'>('readOnly'); // 应用构建脚本的状态
  const [defaultScript, setDefaultScript] = useState<AppBuildScriptDetail>(); // 默认脚本配置
  const [buildScript, setBuildScript] = useState<string>(''); // 修改后的脚本配置
  const [logList, setLogList] = useState<Array<IScriptLog>>([]); // 日志列表
  const [pageInfo, setPageInfo] = useState<{page: number; size: number}>({page: 0, size: 10 });
  const [total, setTotal] = useState<number>(0); // total
  const [loading, setLoading] = useState<boolean>(false); // 表格loading
  const [form] = Form.useForm();

  useEffect(() => {
    if(visible && appInfo) {
      form.setFieldsValue({
        appId: appInfo.id,
        appName: appInfo.name,
        projectName: appInfo.projectName,
      });
      loadCiContent();
    }
  }, [visible, appInfo])

  useEffect(() => {
    if(activeKey == 'change-history') {
      loadCiContentLog();
    }
  }, [appInfo, activeKey, pageInfo])

  // 获取应用默认脚本
  const loadCiContent = useCallback(() => {
    setLoading(true)
    queryCiContent(appInfo.projectId, appInfo.id).then(
      (res) => {
        if(!res) {
          setBuildStatus('create')
        } else {
          setDefaultScript(res);
          setBuildStatus('edit')
          form.setFieldsValue({
            name: res.name,
            scriptType: res.scriptType,
          });
        }
      },
      () => {
        setBuildStatus('readOnly')
      }
    ).finally(
      () => setLoading(false)
    )
  }, [appInfo])

  // 获取应用脚本变更历史
  const loadCiContentLog = useCallback(() => {
    setLoading(true)
    queryCiContentLog(
      appInfo.projectId, 
      appInfo.id,
      pageInfo.page,
      pageInfo.size
    ).then(
      ({ content, totalElements }) => {
        setLogList(content);
        setTotal(totalElements);
      }
    ).finally(
      () => setLoading(false)
    )
  }, [appInfo, pageInfo])

   // 保存应用脚本
  const onUpdateCiContent = useCallback(() => {
    form.validateFields().then(
      (values) => {
        const submitFunc = buildStatus == 'create' ? createCiContent : updateCiContent
        submitFunc(appInfo.projectId, {
          type: 'default',
          status: 1,
          ...defaultScript,
          ...values,
          content: buildScript,
        }).then(
          (res) => {
            message.success('设置脚本成功！')
            handleClose();
          }
        )
      }
    )
  }, [appInfo, defaultScript, buildScript, buildStatus])

  // 关闭弹窗
  const handleClose = useCallback(() => {
    form.resetFields();
    setActiveKey('build-script');
    setBuildStatus('readOnly')
    setDefaultScript(undefined);
    setBuildScript('');
    setLogList([]);
    setPageInfo({page: 0, size: 10});
    setTotal(0);
    onCancel();
  }, [])

  return (
    <Drawer
      visible={visible}
      title={`设置构建应用脚本"${appInfo?.name}"`}
      width={1080}
      onClose={handleClose}
      footer={(
        <Row justify='space-between'>
          <Button onClick={handleClose}>取消</Button>
          <Button 
            type='primary' 
            disabled={buildStatus == 'readOnly'}
            onClick={onUpdateCiContent}
          >
            提交
          </Button>
        </Row>
      )}
    >
      <Alert
        message={(
          <span>
            该页面定义服务编译构建执行的命令，不同服务的开发语言或开发框架使用的编译环境或命令不同，请根据实际情况定义"script"。
            <Button
              href='http://public-service.itwork-book.gw.yonghui.cn/book/itwork/docs/user-guide/cicd/cicd.html' 
              type='link'
              target={'_blank'}
            >
              了解详情
            </Button>
          </span>
        )}
        type="info"
      />
      <Spin spinning={loading}>
        <Tabs activeKey={activeKey} onChange={setActiveKey}>
          <TabPane tab="构建脚本" key="build-script">
            <Form form={form} layout='vertical'>
              <BarTitle style={{margin: '0 0 20px'}}>基本信息</BarTitle>
              <Form.Item name='appId' hidden>
                <Input />
              </Form.Item>
              <Row>
                <Col span={6}>
                  <Form.Item
                    name='appName'
                    label='当前应用'
                    rules={[{required: true, message: '请输入应用名称'}]}
                  >
                    <Input
                      appearance='edit'
                      readOnly
                      placeholder='这是一个应用名称'
                    />
                  </Form.Item>
                </Col>
                <Col span={6} offset={6}>
                  <Form.Item name='projectName' label='项目名称'>
                    <Input
                      appearance='edit'
                      readOnly
                      placeholder='这是一个项目名称'
                    />
                  </Form.Item>
                </Col>
              </Row>
              <BarTitle style={{margin: '0 0 20px'}}>脚本定义</BarTitle>
              <Row>
                <Col span={6}>
                  <Form.Item
                    name='name'
                    label='配置名称'
                    rules={[{required: true, message: '请输入配置名称'}]}
                  >
                    <Input
                      appearance='edit'
                      placeholder='请输入配置名称'
                      disabled={buildStatus == 'readOnly'}
                    />
                  </Form.Item>
                </Col>
                <Col span={6} offset={6}>
                  <Form.Item
                    name='scriptType'
                    label='脚本类型'
                    rules={[{required: true, message: '请选择脚本类型'}]}
                  >
                    <Select
                      options={[
                        { label: 'maven', value: 'maven' },
                        { label: 'node', value: 'node' },
                      ]}
                      appearance='edit'
                      placeholder='这是一个项目名称'
                      disabled={buildStatus == 'readOnly'}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <p>构建脚本（原代码中 .gitlab-ci.yml 的配置内容）</p>
              <CodeMirror
                value={defaultScript?.content || ''}
                mode={'yaml'}
                refresh={Math.random()}
                height={500}
                setValue={setBuildScript}
                readOnly={buildStatus == 'readOnly'}
              />
            </Form>
          </TabPane>
          <TabPane tab="变更历史" key="change-history">
            <Table<IScriptLog>
              rowKey={'id'}
              dataSource={logList}
              columns={[
                {
                  title: '脚本类型',
                  dataIndex: 'scriptType',
                },
                {
                  title: '操作人',
                  dataIndex: 'realName',
                },
                {
                  title: '操作时间',
                  dataIndex: 'lastUpdateDate',
                },
              ]}
              expandable={{
                expandedRowRender: record => (
                  <div>
                    <Row style={{marginBottom: 8}} justify='space-between'>
                      <span>构建脚本</span>
                      <Button
                        size='small'
                        onClick={() => message.success('复制成功～')}
                      >复制</Button>
                    </Row>
                    <CodeMirror
                      value={record?.content || ''}
                      mode={'yaml'}
                      refresh={Math.random()}
                      height={500}
                      readOnly
                    />
                  </div>
                ),
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
          </TabPane>
        </Tabs>
      </Spin>
    </Drawer>
  )
}

export { AppBuildScript };