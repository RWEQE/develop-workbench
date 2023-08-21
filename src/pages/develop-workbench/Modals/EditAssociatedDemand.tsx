import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Drawer, Row, Button, Form, Alert, message, Space, Typography, Popconfirm } from '@middle/ui';
import { Table } from 'antd';
const { Text } = Typography;
import { TeamSpaceSelect } from '@/components/TeamSpaceSelect';
import { IterationSelect } from '@/components/IterationSelect';
import { TaskSelect } from '@/components/TaskSelect';
import { queryBranchTaskList, updateBranchTask, exchangeBranchTask, deleteBranchTask } from '@/services/develp-workbench';
import { IApplicaitonList, IBranchList, IDemandPathInfo } from '@/interfaces/develop-workbench';
import { getRecordId } from '../utils/getRecordId';

interface EditAssociatedDemandProp {
  visible: boolean;
  appInfo: IApplicaitonList;
  branchInfo: IBranchList;
  onAppInfoReload: () => void;
  onCancel: () => void;
}

interface ITaskList extends IDemandPathInfo {
  orderId: number;
}

const EditAssociatedDemand: React.FC<EditAssociatedDemandProp> = ({
  visible,
  appInfo,
  branchInfo,
  onAppInfoReload,
  onCancel,
}) => {

  const [editSet, setEditSet] = useState<Set<number>>(new Set()); // 编辑列表
  const [bindTaskList, setBindTaskList] = useState<ITaskList[]>([]); // 任务列表
  const [loading, setLoading] = useState<boolean>(false); // loading
  const [form] = Form.useForm();

  useEffect(() => {
    if(visible && branchInfo) {
      loadBranchTaskList()
    }
  }, [visible, branchInfo])

  // 查询分支关联的任务列表
  const loadBranchTaskList = useCallback(() => {
    setLoading(true)
    queryBranchTaskList(branchInfo.id).then(
      ({ data }) => {
        const taskList = data.map((item: IDemandPathInfo) => {
          return {
            ...item,
            orderId: getRecordId(),
          }
        })
        setBindTaskList(taskList)
        form.setFieldsValue({
          taskList,
        })
      }
    ).finally(() => setLoading(false))
  }, [branchInfo])

  // 选择框选择
  const onSelectChange = useCallback(
    (type: 'projectId' | 'iterationId' | 'taskId', index: number, option: any) => {
      const taskList = form.getFieldValue('taskList') || [];
      const newTaskList = JSON.parse(JSON.stringify(taskList))
      switch(type) {
        case 'projectId': 
          newTaskList[index].projectName = option.label
          form.setFieldsValue({
            taskList: newTaskList,
          })
          form.resetFields([
            ['taskList', index, 'iterationId'],
            ['taskList', index, 'taskId'],
          ])
          break;
        case 'iterationId': 
          newTaskList[index].iterationName = option.label
          form.setFieldsValue({
            taskList: newTaskList,
          })
          form.resetFields([
            ['taskList', index, 'taskId'],
          ])
          break;
        case 'taskId':
          newTaskList[index].taskName = option.taskName
          form.setFieldsValue({
            taskList: newTaskList,
          })
          break;
      }
    }, []
  )

  // 操作栏操作
  const onRowAction = useCallback(
    (actionType: 'edit' | 'cancel' | 'save' | 'delete', record: ITaskList, index: number) => {
      const taskList = form.getFieldValue('taskList') || [];
      const newTaskList = JSON.parse(JSON.stringify(taskList))
      const originalOrderIdList = bindTaskList.map(item => item.orderId)
      switch(actionType) {
        case 'edit': 
          if(editSet.size !== 0) {
            message.warning('请先处理未保存的信息');
            break;
          }
          setEditSet((set) => {
            set.add(record.orderId);
            return new Set(set);
          });
          break;
        case 'cancel': 
          if(originalOrderIdList.includes(record.orderId)) { // 是取消原有数据的编辑
            newTaskList.splice(index, 1, bindTaskList[index])
            form.setFieldsValue({ taskList: newTaskList })
          } else { // 是取消 新增的数据
            newTaskList.splice(index, 1)
            form.setFieldsValue({ taskList: newTaskList })
          }
          setEditSet((set) => {
            set.delete(record.orderId);
            return new Set(set);
          });
          break;
        case 'save':
          if(!record.projectId || !record.iterationId || !record.taskId) {
            message.warning('请先填写数据！');
            return;
          }
          if(originalOrderIdList.includes(record.orderId)) { // 是更新操作
            exchangeBranchTask({
              branchId: branchInfo.id,
              oldTaskId: bindTaskList[index].taskId,
              newTaskId: record.taskId,
            }).then(() => {
              message.success('更新绑定关系成功！');
              loadBranchTaskList();
            })
          } else { // 是新增操作
            updateBranchTask({
              projectId: appInfo.projectId,
              appId: appInfo.id,
              branchName: branchInfo.branchName,
              taskId: record.taskId,
            }).then(() => {
              message.success('新增绑定关系成功！');
              loadBranchTaskList();
            })
          }
          setEditSet((set) => {
            set.delete(record.orderId);
            return new Set(set);
          });
          break;
        case 'delete':
          deleteBranchTask(
            appInfo.projectId,
            record.taskId,
            branchInfo.id,
          ).then(() => {
            message.success('分支删除成功！');
            loadBranchTaskList();
          })
          break;
      }
    }, [editSet, bindTaskList, appInfo, branchInfo]
  )

  // 操作栏操作
  const onAddTask = useCallback(
    () => {
      if(editSet.size !== 0) {
        message.warning('请先处理未保存的信息');
        return;
      }
      const taskList = form.getFieldValue('taskList') || [];
      const newTaskList = JSON.parse(JSON.stringify(taskList))
      const newOrderId = getRecordId()
      newTaskList.push({
        orderId: newOrderId,
        projectId: undefined,
        iterationId: undefined,
        taskId: undefined,
      })
      setEditSet((set) => {
        set.add(newOrderId);
        return new Set(set);
      });
      form.setFieldsValue({
        taskList: newTaskList,
      })
    }, [editSet]
  )

  // 关闭弹窗
  const handleClose = useCallback(() => {
    form.resetFields();
    setBindTaskList([]);
    setEditSet(new Set());
    onAppInfoReload();
    onCancel();
  }, [onAppInfoReload])

  return useMemo(() => {
    return (
      <Drawer
        visible={visible}
        title={`修改关联任务（${branchInfo?.branchName}）`}
        width={1000}
        onClose={handleClose}
        footer={(
          <Row justify='start'>
            <Button onClick={handleClose}>取消</Button>
          </Row>
        )}
      >
        <Alert
          message='您可在此修改该分支关联的任务。'
          type="info"
        />
        <br />
        <Form form={form}>
          <Form.Item noStyle name={'taskList'} />
          <Form.Item noStyle shouldUpdate={(pre, next) => pre.taskList !== next.taskList}>
            {({ getFieldValue }) => {
              const taskList = getFieldValue('taskList') || [];
              return (
                <Table<ITaskList>
                  rowKey={'orderId'}
                  loading={loading}
                  dataSource={taskList}
                  columns={[
                    {
                      title: '序号',
                      dataIndex: 'orderId',
                      width: 90,
                      render: (_, record, index) => index + 1
                    },
                    {
                      title: '项目空间',
                      dataIndex: 'projectId',
                      width: 180,
                      render: (_, record, index) => (
                        editSet.has(record.orderId) ? (
                          <TeamSpaceSelect
                            name={['taskList', index, 'projectId']}
                            placeholder="选择空间"
                            formItemStyle={{marginBottom: 0, width: '168px'}}
                            allowClear={false}
                            onChange={(value, option) => onSelectChange('projectId', index, option)}
                          />
                        ) : (
                          <Text 
                            style={{maxWidth: 180}}
                            ellipsis={{tooltip: record.projectName}}
                          >
                            {record.projectName}
                          </Text>
                        )
                      )
                    },
                    {
                      title: '迭代',
                      dataIndex: 'iterationId',
                      width: 180,
                      render: (_, record, index) => (
                        editSet.has(record.orderId) ? (
                          <IterationSelect
                            name={['taskList', index, 'iterationId']}
                            spaceName={['taskList', index, 'projectId']}
                            placeholder="选择迭代"
                            formItemStyle={{marginBottom: 0, width: '168px'}}
                            disabled={record.projectId === undefined}
                            allowClear={false}
                            onChange={(value, option) => onSelectChange('iterationId', index, option)}
                          />
                        ) : (
                          <Text
                            style={{maxWidth: 180}}
                            ellipsis={{tooltip: record.iterationName}}
                          >
                            {record.iterationName}
                          </Text>
                        )
                      )
                    },
                    {
                      title: '需求-任务',
                      dataIndex: 'taskId',
                      width: 350,
                      render: (_, record, index) => (
                        editSet.has(record.orderId) ? (
                          <TaskSelect
                            name={['taskList', index, 'taskId']}
                            disabled={record.iterationId === undefined}
                            iterationName={['taskList', index, 'iterationId']}
                            placeholder="选择需求/任务"
                            required="请先选择需求/任务"
                            formItemStyle={{marginBottom: 0, width: '318px'}}
                            allowClear={false}
                            onChange={(value, option) => onSelectChange('taskId', index, option)}
                          />
                        ) : (
                          <Text
                            style={{maxWidth: 350}}
                            ellipsis={{tooltip: record.taskName}}
                          >
                            {record.demandName} - {record.taskName}
                          </Text>
                        )
                      )
                    },
                    {
                      title: '操作',
                      dataIndex: 'action',
                      width: 120,
                      render: (_, record, index) => (
                        <Space>
                          {
                            editSet.has(record.orderId) ? (
                              <a  onClick={() => onRowAction('save', record, index)}>保存</a>
                            ) : (
                              <a onClick={() => onRowAction('edit', record, index)}>编辑</a>
                            )
                          }
                          {
                            editSet.has(record.orderId) ? (
                              <a onClick={() => onRowAction('cancel', record, index)}>取消</a>
                            ) : (
                              <Popconfirm
                                placement='topRight'
                                title="确定要删除绑定这条任务?"
                                onConfirm={() => onRowAction('delete', record, index)}
                                okText="确定"
                                cancelText="取消"
                              >
                                <a>删除</a>
                              </Popconfirm>
                            )
                          }
                        </Space>
                      )
                    },
                  ]}
                  pagination={false}
                />
              )
            }}
          </Form.Item>
          <Button
            style={{marginTop: '12px'}}
            type='dashed'
            block
            onClick={onAddTask}
          >
            新增
          </Button>
        </Form>
      </Drawer>
    )
  }, [visible, appInfo, branchInfo, editSet, bindTaskList, loading, onAppInfoReload])
}

export { EditAssociatedDemand };