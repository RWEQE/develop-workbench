import { useRef, useState } from 'react';
import { Form, message } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import ProForm, { DrawerForm, ProFormSelect } from '@ant-design/pro-form';
import { BarTitle } from '@/components/BarTitle';
import BranchTable from './BranchTable';
import ProDescriptions from '@ant-design/pro-descriptions';
import { queryDetail, queryUsers, updateModerate } from '@/services/code-check';

type Props = {
  tag: string;
  checkData: CodeCheckAPI.ItemInfo;
  refreshTable?: () => void;
};
type CodeCheckDetail = CodeCheckAPI.Detail | null;
export default ({ tag, checkData, refreshTable }: Props) => {
  const formRef = useRef<ProFormInstance>();
  const editable = tag === 'edit';
  const { projectId, crCode } = checkData;

  const [detail, setDetail] = useState<CodeCheckDetail>(null);

  const onVisibleChange = async (visiable: boolean) => {
    try {
      if (!visiable || !projectId || !crCode) return;
      const result = await queryDetail(projectId, crCode);
      setDetail(result);
      if (editable) {
        formRef.current?.setFieldsValue({ moderateName: result.moderator });
      }
    } catch (error) {}
  };

  const onValuesChange = (changedValues: any) => {
    const { moderateName = '' } = changedValues;
    try {
      updateModerate(projectId!, crCode!, moderateName).then(() => {
        message.success('修改成功');
        if (refreshTable) {
          refreshTable();
        }
      });
    } catch (error) {}
  };

  return (
    <DrawerForm
      title={`${editable ? '修改' : '查看'}代码审核`}
      formRef={formRef}
      trigger={<a>{editable ? '修改' : '查看'}</a>}
      autoFocusFirstInput
      drawerProps={{ destroyOnClose: true }}
      submitter={{
        searchConfig: { resetText: '关闭' },
        submitButtonProps: { style: { display: 'none' } },
      }}
      initialValues={{ moderateName: detail?.moderator }}
      onVisibleChange={onVisibleChange}
      onValuesChange={onValuesChange}
    >
      <BarTitle style={{ marginBottom: 20 }}>审核信息</BarTitle>
      {editable && (
        <ProForm.Group>
          <ProFormSelect
            name="moderateName"
            label="审核人"
            width="sm"
            showSearch
            allowClear={false}
            debounceTime={500}
            fieldProps={{ showSearch: true, filterOption: false }}
            request={async (params) => {
              try {
                const { content = [] } = await queryUsers(params?.keyWords);
                return content.map((item: { realName: string; loginName: string }) => ({
                  label: item.realName,
                  value: item.loginName,
                }));
              } catch (error) {
                return [];
              }
            }}
          />
        </ProForm.Group>
      )}
      <ProDescriptions column={2} layout="vertical" style={{ marginBottom: 20 }}>
        {!editable && (
          <ProDescriptions.Item label="审核人">{detail?.moderatorDisplayName}</ProDescriptions.Item>
        )}
        <ProDescriptions.Item label="创建人">{detail?.authDisplayName}</ProDescriptions.Item>
        <ProDescriptions.Item label="fisheye项目">{detail?.projectName}</ProDescriptions.Item>
        <ProDescriptions.Item label="创建时间">{detail?.createDate}</ProDescriptions.Item>
        <ProDescriptions.Item label="最后修改时间">{detail?.lastUpdateDate}</ProDescriptions.Item>
      </ProDescriptions>

      <BarTitle>分支信息</BarTitle>
      <Form.Item label="分支列表" style={{ margin: 0, marginBottom: 30 }}>
        <BranchTable dataSource={detail?.reviewBranchList || []} />
      </Form.Item>
    </DrawerForm>
  );
};
