import React, { useMemo, useCallback } from 'react';
import { 
  Drawer, 
  Row, 
  Col, 
  Button, 
  Alert, 
  Form, 
  Select, 
  Input, 
  Avatar, 
  message,
} from '@middle/ui';
import { CompleteDemandSelect } from '@/components/CompleteDemandSelect';
import { BranchTagSelect } from '@/components/BranchTagSelect';
import { createBranch } from '@/services/develp-workbench';
import { IApplicaitonList, BranchTypeEnum } from '@/interfaces/develop-workbench';
import { getBranchRealName } from '@/pages/develop-workbench/utils';

interface CreateBranchProp {
  visible: boolean;
  appInfo: IApplicaitonList;
  onAppInfoReload: () => void;
  onCancel: () => void;
}

const CreateBranch: React.FC<CreateBranchProp> = ({
  visible,
  appInfo,
  onAppInfoReload,
  onCancel,
}) => {

  const [form] = Form.useForm();

  // 提交
  const onSubmit = useCallback(
    () => {
      form.validateFields().then(
        (values) => {
          const { branchType, branchName, branchSource, teamSpaceId, taskId } = values;
          createBranch({
            projectId: appInfo.projectId,
            appId: appInfo.id,
            branchName: branchType!=='custom' ? `${branchType}-0${teamSpaceId}-${taskId}${branchName}` : branchName,
            originBranch: getBranchRealName(branchSource),
            taskId: taskId || '',
          }).then(
            () => {
              message.success('创建分支成功！')
              onAppInfoReload();
              handleClose();
            }
          )
        }
      )
    },
    [appInfo, onAppInfoReload],
  )

  // 关闭弹窗
  const handleClose = useCallback(() => {
    form.resetFields();
    onCancel();
  }, [])

  return useMemo(() => {
    return (
      <Drawer
        visible={visible}
        title={`新建分支（${appInfo?.name}）`}
        width={960}
        onClose={handleClose}
        footer={(
          <Row justify='space-between'>
            <Button onClick={handleClose}>取消</Button>
            <Button type='primary' onClick={onSubmit}>
              提交
            </Button>
          </Row>
        )}
      >
        <Alert
          message='您在此选择该分支要解決的问题、分支来源，修改默认的分支类型及分支名称，即可创建分支。了解详情'
          type="info"
          />
        <Form form={form} layout='vertical'>
          <CompleteDemandSelect form={form} />
          <Row gutter={24}>
            <Col span={8}>
              <BranchTagSelect
                name={'branchSource'}
                label='分支来源'
                required='请填写分支来源'
                appearance='edit'
                placeholder='请选择'
                projectId={appInfo?.projectId}
                appId={appInfo?.id}
                sortBranchTag={true}
                form={form}
                hasHashSwitch
              />
            </Col>
            <Col span={8}>
              <Form.Item
                name={'branchType'}
                label='分支类型'
                rules={[{required: true, message: '请选择分支类型'}]}
              >
                <Select
                  appearance='edit'
                  placeholder='请选择'
                >
                  {
                    ['feature', 'bugfix', 'release', 'hotfix', 'custom'].map(item => {
                      return (
                        <Select.Option
                          key={item}
                          value={item}
                        >
                          <Avatar
                            style={{ 
                              color: BranchTypeEnum[item].color, 
                              backgroundColor: BranchTypeEnum[item].backgroundColor,
                              minWidth: 24,
                            }}
                            size="small"
                          >
                            {BranchTypeEnum[item].avatar}
                          </Avatar>
                          &ensp;
                          {item}
                        </Select.Option>
                      )
                    })
                  }
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                noStyle
                shouldUpdate={(pre, next) => 
                  pre.branchType !== next.branchType || pre.teamSpaceId !== next.teamSpaceId || pre.taskId !== next.taskId
                }
              >
                {({ getFieldValue }) => {
                  const branchType = getFieldValue('branchType') || 'custom';
                  const teamSpaceId = getFieldValue('teamSpaceId') ? '0' + getFieldValue('teamSpaceId') : 'projectId';
                  const taskId = getFieldValue('taskId') || 'taskId';
                  return (
                    <Form.Item
                      name={'branchName'}
                      label='分支名称'
                      rules={[
                        {
                          required: true, 
                          message: '请输入分支名称（仅允许数字, 点, 中横线, 字母，不能有中文, 斜杠, 下划线, 和其他特殊字符等）',
                          pattern: /^[0-9a-zA-Z-.]{1,}$/,
                        }
                      ]}
                    >
                      <Input
                        prefix={
                          branchType !== 'custom' ? 
                            branchType + '-' + teamSpaceId + '-' + taskId :
                            ''
                        }
                        appearance='edit'
                        placeholder='请输入分支名称（仅允许数字, 点, 中横线, 字母，不能有中文, 斜杠, 下划线, 和其他特殊字符等）'
                      />
                    </Form.Item>
                  )
                }}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    )
  }, [visible, appInfo, onAppInfoReload])
}

export { CreateBranch };