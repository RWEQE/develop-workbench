import React, { useCallback, useMemo } from 'react';
import { Modal, Form, Input, message } from '@middle/ui';
import { createPipelineLabel } from '@/services/develp-workbench';
import { IApplicaitonList, IPipelineList } from '@/interfaces/develop-workbench';

interface CreateLabelProp {
  visible: boolean;
  appInfo: IApplicaitonList;
  pipelineInfo: IPipelineList | undefined;
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateLabel: React.FC<CreateLabelProp> = ({
  visible,
  appInfo,
  pipelineInfo,
  onSuccess,
  onCancel,
}) => {

  const [form] = Form.useForm();

  // 确认
  const onOk = useCallback(() => {
    if(!pipelineInfo) return;
    form.validateFields().then(
      (values) => {
        const { name } = values;
        createPipelineLabel(
          appInfo.projectId,
          pipelineInfo.pipelineId,
          pipelineInfo.pipelineTags ? pipelineInfo.pipelineTags + ',' + name : name,
          pipelineInfo.versionId,
        ).then(
          (res) => {
            message.success('标签创建成功!');
            onSuccess();
            handleClose();
          }
        )
      }
    )
  }, [appInfo, pipelineInfo])

  // 关闭弹窗
  const handleClose = useCallback(() => {
    form.resetFields();
    onCancel();
  }, [])

  return useMemo(() => {
    return (
      <Modal
        visible={visible}
        title='新增标签'
        width={560}
        onOk={onOk}
        onCancel={handleClose}
      >
        <Form form={form}>
          <Form.Item 
            name={'name'}
            label='标签名称'
            rules={[{required: true, message: '请输入标签名称!'}]}
          >
            <Input placeholder='请输入' />
          </Form.Item>
        </Form>
      </Modal>
    )
  }, [visible, appInfo, pipelineInfo])
}

export { CreateLabel };