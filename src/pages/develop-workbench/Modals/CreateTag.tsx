import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Drawer, Row, Button, Alert, Form, Col, Input, message } from '@middle/ui';
import { BranchTagSelect } from '@/components/BranchTagSelect';
import CodeMirror from '@/components/CodeMirror';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { createAppTag, updateAppTag, checkTag } from '@/services/develp-workbench';
import { IApplicaitonList, TagControlProp } from '@/interfaces/develop-workbench';
import styless from './index.less';
import reactMarkDownStyless from './reactMarkDown.less'

interface CreateTagProp {
  visible: boolean;
  tagControl?: TagControlProp;
  appInfo: IApplicaitonList;
  onAppInfoReload: () => void;
  onCancel: () => void;
}

const CreateTag: React.FC<CreateTagProp> = ({
  visible,
  tagControl = { controlType: 'create' },
  appInfo,
  onAppInfoReload,
  onCancel,
}) => {

  const { controlType, tagInfo } = tagControl;
  const [releaseLog, setReleaseLog] = useState<string>(''); // 发布日志
  const [form] = Form.useForm();

  useEffect(() => {
    if(visible && tagControl.controlType == 'edit') {
      form.setFieldsValue({
        tagName: tagInfo?.release?.tagName || tagInfo?.tagName,
      })
      setReleaseLog(tagInfo?.release?.description || '')
    }
  }, [visible, tagControl])

  // 校验标签是否可用
  const checkTagEnable = useCallback((tagName: string) => {
    return checkTag({
      projectId: appInfo.projectId,
      appId: appInfo.id,
      tag: tagName,
    })
  }, [appInfo])

  // 提交
  const onSubmit = useCallback(() => {
    form.validateFields(controlType == 'create' ? ['tagName', 'branchSource'] : []).then(
      (values) => {
        const { tagName, branchSource } = values
        const editTagName = form.getFieldsValue(['tagName'])?.tagName;
        const submitFunction = controlType == 'create' ? createAppTag : updateAppTag
        submitFunction({
          projectId: appInfo.projectId,
          appId: appInfo.id,
          tag: controlType == 'create' ? tagName : editTagName,
          ref: branchSource,
          releaseNotes: releaseLog,
        }).then(
          (res) => {
            message.success(`标记${controlType == 'create' ? '创建' : '修改'}成功！`);
            onAppInfoReload();
            handleClose();
          }
        )
      }
    )
  }, [tagControl, appInfo, releaseLog, onAppInfoReload])

  // 关闭弹窗
  const handleClose = useCallback(() => {
    form.resetFields();
    setReleaseLog('');
    onCancel();
  }, [])

  return useMemo(() => {
    return (
      <Drawer
        visible={visible}
        title={`${controlType == 'edit' ? '编辑' : '新建'}标记（${appInfo?.name}）`}
        width={960}
        onClose={handleClose}
        footer={(
          <Row justify='space-between'>
            <Button onClick={handleClose}>取消</Button>
            <Button type='primary' onClick={onSubmit}>提交</Button>
          </Row>
        )}
      >
        <Alert
          message='您在此填写标记名称，选择标记来源，即可基于某一分支创建标记。'
          type='info'
        />
        <br />
        <Form form={form} layout='vertical'>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name={'tagName'}
                label='标记名称'
                tooltip='支持x.x.x格式，其中x只能为非负整数；若使用语义化标记，建议格式：x.x.x-alpha.1'
                validateTrigger={['onBlur']}
                rules={[
                  {
                    required: true, 
                    message: '请输入标记名称',
                  },
                  {
                    validator: async (_, value) => {
                      const pa = /^\d+(\.\d+){2}$/;
                      const SemanticVersion = /^\d+(\.\d+){2}-[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*$/;
                      if (value && (pa.test(value) || SemanticVersion.test(value))) {
                        try {
                          const res = await checkTagEnable(value); 
                          if(res) {
                            return Promise.resolve();
                          } else {
                            return Promise.reject(new Error('标记名称已存在'));
                          }
                        } catch (error) {
                          return Promise.reject(new Error('校验标记名称失败'));
                        }
                      } else {
                        return Promise.reject(new Error('支持x.x.x格式，其中x只能为非负整数；若使用语义化标记，建议格式：x.x.x-alpha.1'));
                      }
                    },
                  },
                ]}
              >
                <Input
                  placeholder='请输入标记名称'
                  appearance='edit'
                  disabled={controlType == 'edit'}
                />
              </Form.Item>
            </Col>
            {
              controlType !== 'edit' && (
                <Col span={10}>
                  <BranchTagSelect
                    name={'branchSource'}
                    label='分支来源'
                    required='请选择标记来源'
                    tooltip='apptag.tip'
                    appearance='edit'
                    placeholder='请选择'
                    projectId={appInfo?.projectId}
                    appId={appInfo?.id}
                  />
                </Col>
              )
            }
          </Row>
          <div className={styless.tagMarkDown}>
            <span>
              发布日志
              <span className={styless.tagMarkDownTips}>
                （在这里编辑您的发布日志，支持MarkDown格式）
              </span>
            </span>
            <div>
              <CodeMirror
                value={controlType == 'edit' ? tagInfo?.release?.description || '' : ''}
                mode={'markdown'}
                refresh={Math.random()}
                height={200}
                setValue={setReleaseLog}
              />
            </div>
          </div>
          <div className={styless.tagMarkDown}>
            <span>
              预览内容
            </span>
            <div className={styless.reactMarkDown}>
              <div className={reactMarkDownStyless.c7NMdParse}>
                <ReactMarkdown
                  children={releaseLog}
                  skipHtml={false}
                  rehypePlugins={[rehypeRaw]}
                />
              </div>
            </div>
          </div>
        </Form>
      </Drawer>
    )
  }, [visible, tagControl, appInfo, releaseLog, onAppInfoReload])
}

export { CreateTag };