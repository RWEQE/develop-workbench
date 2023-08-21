import React, { useEffect, useRef } from 'react';
import { ProFormTextArea } from '@ant-design/pro-form';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Drawer, Tabs, Space, Button, Row, Form, Card, message } from 'antd';
import { BarTitle } from '@/components/BarTitle';
import { TextDetail } from './TextDetail';
import { queryChangeDesc, editChangeDesc } from '@/services/maven-repository'
import { IOperationLog, MavneItem } from '@/interfaces/maven-repository';
import styless from '../index.less';
import { useModel } from 'umi';

interface EditDescriptionProp {
  visible: boolean;
  dataInfo: MavneItem;
  onCancel: () => void;
  onSuccess: () => void;
}

const EditDescription: React.FC<EditDescriptionProp> = ({
  visible,
  dataInfo,
  onCancel,
  onSuccess,
}) => {

  const [form] = Form.useForm();
  const actionRef = useRef<ActionType>();
  const projectId = useModel('@@initialState')?.initialState?.projectList![0]?.id; // 当前用户的 首个项目id

  useEffect(() => {
    if(visible && dataInfo) {
      form.setFieldsValue({
        newDescription: dataInfo.description,
      })
      actionRef.current?.reload();
    }
  }, [visible, dataInfo])

  const onSubmit = () => {
    form.validateFields().then(
      (values) => {
        editChangeDesc(projectId || 0, {
          ...values,
          infoId: dataInfo.id,
        }).then(
          () => {
            message.success('描述修改成功！')
            onSuccess();
            handleClose();
          }
        )
      }
    )
  }

  const handleClose = () => {
    form.resetFields();
    onCancel();
  }

  const columns: ProColumns<IOperationLog>[] = [
    {
      title: '操作人',
      dataIndex: 'createByName',
    },
    {
      title: '操作时间',
      dataIndex: 'creationDate',
    },
    {
      title: '操作描述',
      dataIndex: 'content',
      render: (text, record) => (
        <TextDetail value={record.content} />
      )
    },
  ] 

  return (
    <div>
      <Drawer
        title={'修改描述'}
        width={960}
        visible={visible}
        maskClosable
        onClose={handleClose}
        footer={(
          <Row justify='end'>
            <Space>
              <Button onClick={handleClose}>取消</Button>
              <Button type='primary' onClick={onSubmit}>提交</Button>
            </Space>
          </Row>
        )}
      >
        <Tabs defaultActiveKey="editDescription">
          <Tabs.TabPane tab="修改描述" key="editDescription">
            <Form form={form}>
              <BarTitle>
                变更描述
              </BarTitle>
              <div className={styless.gavSourceBox}>
                <div>
                  <ProFormTextArea
                    name="newDescription"
                    label="变更描述"
                    placeholder="请输入变更描述，后续可修改该变更描述。"
                    fieldProps={{
                      autoSize: {minRows: 20},
                      allowClear: true,
                    }}
                    rules={[
                      {
                        required: true,
                        message: "请输入变更描述，后续可修改该变更描述。",
                      },
                    ]}
                  />
                </div>
                <Card 
                  className={`${styless.gavTipsCard} ${styless.descriptionExample}`}
                  style={{marginTop: 0}}
                >
                  <>
                    <div><b>示例：</b></div>
                    <div className={styless.repositoryTitle}>
                      <div>Bug Fixes</div>
                      <div>•资源管理：修复拓扑查询bug</div>
                      <p>•资源管理：修复拓扑编辑bug</p>
                      <div>Features</div>
                      <div>•资源管理：资源拓扑功能添加</div>
                    </div>
                  </>
                </Card>
              </div>
            </Form>
          </Tabs.TabPane>
          <Tabs.TabPane tab="操作记录" key="operationLog">
            <ProTable<IOperationLog>
              actionRef={actionRef}
              className={styless.mavenReferenceTable}
              columns={columns}
              request={async (params = {}, sort, filter) => {
                const { current, pageSize } = params
                return queryChangeDesc(projectId || 0, {
                  pageNo: current! - 1,
                  pageSize: pageSize!,
                  infoId: dataInfo?.id,
                }).then(({ data: { content, totalElements }}) => {
                  return {
                    data: content,
                    total: totalElements,
                    success: true,
                  }
                })
              }}
              columnsState={{
                persistenceKey: 'develop-maven-description',
                persistenceType: 'localStorage',
              }}
              rowKey="id"
              scroll={{ x: 'max-content' }}
              search={false}
              options={false}
              pagination={{ 
                defaultPageSize: 10,
                size: 'default',
                showSizeChanger: true,
              }}
            />
          </Tabs.TabPane>
        </Tabs>
      </Drawer>
    </div>
  )
}

export { EditDescription };