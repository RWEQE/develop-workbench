import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Drawer, Row, Button, Alert, Form, Col, Input } from '@middle/ui';
import { Table } from 'antd';
import { BranchesOutlined, createFromIconfontCN } from '@ant-design/icons';
import { BarTitle } from '@/components/BarTitle';
import { queryPipelineVariable } from '@/services/develp-workbench/index';
import { IApplicaitonList, IPipelineList } from '@/interfaces/develop-workbench';

const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_3408001_fcd1almsc64.js',
});

interface PipelineCiVariableProp {
  visible: boolean;
  appInfo: IApplicaitonList;
  pipelineInfo: IPipelineList | undefined;
  onSuccess: () => void;
  onCancel: () => void;
}

const PipelineCiVariable: React.FC<PipelineCiVariableProp> = ({
  visible,
  appInfo,
  pipelineInfo,
  onSuccess,
  onCancel,
}) => {

  const [variables, setVariables] = useState<Array<{key: string; value: string}>>([]); // 变量
  const [loading, setLoading] = useState<boolean>(false); // loading
  const [form] = Form.useForm();

  useEffect(() => {
    if(visible && appInfo && pipelineInfo) {
      form.setFieldsValue({
        ...appInfo,
        ...pipelineInfo,
      });
      loadGlobalVariable();
    }
  }, [visible, appInfo, pipelineInfo])

  // 查询已有全局变量
  const loadGlobalVariable = useCallback(() => {
    setLoading(true)
    queryPipelineVariable(pipelineInfo?.pipelineId!).then(
      ({ data }) => {
        const newVariables = JSON.parse(data?.variables || '{}')
        const newContent = []
        for (const [key, value] of Object.entries(newVariables)) {
          newContent.push({ key, value })
        }
        setVariables(newContent as any)
      }
    ).then(
      () => setLoading(false)
    )
  }, [pipelineInfo])

  // 关闭弹窗
  const handleClose = useCallback(() => {
    form.resetFields();
    setVariables([]);
    onCancel();
  }, [])

  return useMemo(() => {
    return (
      <Drawer
        visible={visible}
        title={`持续集成作业 "#${pipelineInfo?.pipelineId}" 的变量`}
        width={1080}
        onClose={handleClose}
        footerStyle={{alignItems: 'start'}}
        footer={(<Button onClick={handleClose}>取消</Button>)}
      >
        <Alert
          message='通过变量runner作用域所有作业中,对当前的project可用,可以使用变量来保存需要区分环境的构建参数或其他内容。'
          type='info'
        />
        <Form form={form} layout='vertical'>
          <BarTitle>
            基本信息
          </BarTitle>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name={'name'}
                label='应用名称'
                style={{marginBottom: 0}}
              >
                <Input
                  appearance='edit'
                  placeholder='这是一个应用名称'
                  readOnly
                />
              </Form.Item>
            </Col>
            <Col span={8} offset={4}>
              <Form.Item
                name={'code'}
                label='应用编码'
                style={{marginBottom: 0}}
              >
                <Input
                  appearance='edit'
                  placeholder='这是一个应用编码'
                  readOnly
                />
              </Form.Item>
            </Col>
          </Row>
          <BarTitle>
            执行变量
          </BarTitle>
          <Table
            rowKey={'key'}
            loading={loading}
            dataSource={variables}
            columns={[
              {
                title: '变量的key',
                dataIndex: 'key',
                width: '50%',
              },
              {
                title: '变量的value',
                dataIndex: 'value',
                width: '50%',
              }
            ]}
            pagination={false}
            size={'small'}
          />
          <BarTitle>
            提交信息
          </BarTitle>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label='触发分支/标记'>
                <BranchesOutlined />
                <a
                  style={{color: '#222', marginLeft: 4}}
                  href={`${pipelineInfo?.gitlabUrl?.split('.git')[0]}/commits/${pipelineInfo?.ref}`}
                  target='_blank'
                > 
                  {pipelineInfo?.ref}
                </a>
                <IconFont
                  style={{margin: '0 4px 0 32px', fontSize: 20, verticalAlign: 'middle'}}
                  type='icon-commit'
                />
                <a
                  href={`${pipelineInfo?.gitlabUrl?.split('.git')[0]}/commit/${pipelineInfo?.commit}`}
                  target='_blank'
                > 
                  {pipelineInfo?.commit?.slice(0, 13)}...
                </a>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label='操作人'>
                <span> {pipelineInfo?.pipelineUserName}</span>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label='提交信息'>
                <a
                  style={{color: '#222'}}
                  href={`${pipelineInfo?.gitlabUrl?.split('.git')[0]}/commit/${pipelineInfo?.commit}`}
                  target='_blank'
                > 
                  {pipelineInfo?.commitContent}
                </a>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    )
  }, [visible, appInfo, pipelineInfo, variables, loading])
}

export { PipelineCiVariable };