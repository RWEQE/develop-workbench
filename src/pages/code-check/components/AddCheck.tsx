import { useRef, useState } from 'react';
import { Button, Form, message, Space, Tooltip } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-form';
import { ProFormDependency } from '@ant-design/pro-form';
import ProForm, { DrawerForm, ProFormSelect } from '@ant-design/pro-form';
import { PlusOutlined } from '@ant-design/icons';
import { BarTitle } from '@/components/BarTitle';
import BranchTable from './BranchTable';
import {
  createCheck,
  queryApps,
  queryBranch,
  queryIterations,
  queryPojects,
  queryTask,
  queryUsers,
} from '@/services/code-check';
import { useModel } from 'umi';
type Props = {
  refreshTable: () => void;
};
export default ({ refreshTable }: Props) => {
  const currentUser = useModel('@@initialState')?.initialState?.currentUser;

  const formRef = useRef<ProFormInstance>();
  const [projects, setProjects] = useState([]);
  // 选中的分支列表
  const [branchList, setBranchList] = useState<any[]>([]);

  const loadProjects = async () => {
    if (!currentUser) return;
    try {
      const result = await queryPojects(currentUser.id);
      setProjects(result);
    } catch (error) {}
  };

  const handleAddBranch = () => {
    const { appInfo, branchInfo } = formRef.current?.getFieldsValue(['appInfo', 'branchInfo']);
    const { id, ...branch } = JSON.parse(branchInfo);
    if (branchList.filter((item: any) => item.id === id).length === 0) {
      setBranchList([...branchList, { ...JSON.parse(appInfo), ...branch, id }]);
    }
    message.success('已添加');
  };

  const onValuesChange = (changedValues: any) => {
    const { projectInfo, iteration, taskInfo, appInfo } = changedValues;
    if (projectInfo) {
      formRef.current?.setFieldsValue({ iteration: undefined });
    }
    if (projectInfo || iteration) {
      formRef.current?.setFieldsValue({ taskInfo: undefined });
    }
    if (projectInfo || iteration || taskInfo) {
      formRef.current?.setFieldsValue({ appInfo: undefined });
    }
    if (projectInfo || iteration || taskInfo || appInfo) {
      formRef.current?.setFieldsValue({ branchInfo: undefined });
    }
  };

  return (
    <DrawerForm
      title="新建代码审核"
      formRef={formRef}
      trigger={
        <Button key="button" icon={<PlusOutlined />} type="primary">
          新建
        </Button>
      }
      autoFocusFirstInput
      drawerProps={{ destroyOnClose: true }}
      onVisibleChange={(visiable: boolean) => {
        if (visiable) {
          loadProjects();
        } else {
          setBranchList([]);
        }
      }}
      onValuesChange={onValuesChange}
      onFinish={async (values) => {
        if (branchList.length === 0) {
          message.warning('请添加关联需求');
          return false;
        }
        try {
          const { taskInfo, moderator, projectInfo } = values;
          const { id, code, name } = JSON.parse(projectInfo);
          const { id: taskId, name: summary } = JSON.parse(taskInfo);
          const params = {
            issueId: taskId,
            issueNum: taskId,
            reviewBranchList: branchList,
            moderator,
            summary,
            projectId: id,
            projectName: name,
            projectCode: code,
          };
          const result = await createCheck(id, params);
          if (result === '添加成功') {
            message.success('添加成功！');
            refreshTable();
            return true;
          } else {
            try {
              const { message: msg } = JSON.parse(result);
              message.error(msg);
            } catch (error) {
              message.error(result);
            } finally {
              return false;
            }
          }
        } catch (error) {
          console.log(error);
          // 不关闭弹窗
          return false;
        }
      }}
    >
      <BarTitle style={{ marginBottom: 20 }}>选择需求</BarTitle>
      <ProForm.Group>
        <Form.Item label="关联需求" required style={{ margin: 0 }}>
          <Space direction="horizontal">
            <ProFormSelect
              name="projectInfo"
              width="sm"
              placeholder="选择空间"
              rules={[{ required: true, message: '请选择' }]}
              debounceTime={500}
              disabled={branchList.length !== 0}
              fieldProps={{
                options: projects.map(({ id, code, name, summary }: any) => ({
                  label: `${name}(${code})`,
                  value: JSON.stringify({ id, code, name, summary }),
                })),
                showSearch: true,
                filterOption: (input, option) =>
                  JSON.stringify(option?.label).toLowerCase().includes(input.toLowerCase()),
              }}
            />
            <ProFormDependency name={['projectInfo']}>
              {({ projectInfo: dependProjectInfo }) => {
                return (
                  <ProFormSelect
                    name="iteration"
                    width="sm"
                    disabled={!dependProjectInfo || branchList.length !== 0}
                    showSearch
                    debounceTime={300}
                    placeholder="选择迭代"
                    rules={[{ required: true, message: '请选择' }]}
                    dependencies={['projectInfo']}
                    fieldProps={{
                      filterOption: (input, option) =>
                        JSON.stringify(option?.label).toLowerCase().includes(input.toLowerCase()),
                    }}
                    request={async ({ projectInfo }) => {
                      if (!projectInfo) return [];
                      const { id: projectId } = JSON.parse(projectInfo);
                      try {
                        const { code, data } = await queryIterations(projectId);
                        if (code === 200000) {
                          return data.map(({ name, id }: any) => ({ label: name, value: id }));
                        }
                        return [];
                      } catch (error) {
                        return [];
                      }
                    }}
                  />
                );
              }}
            </ProFormDependency>
            <ProFormDependency name={['iteration']}>
              {({ iteration: dependIteration }) => {
                return (
                  <ProFormSelect
                    name="taskInfo"
                    width="sm"
                    showSearch
                    disabled={!dependIteration || branchList.length !== 0}
                    debounceTime={300}
                    placeholder="选择需求/任务"
                    rules={[{ required: true, message: '请选择' }]}
                    dependencies={['iteration']}
                    fieldProps={{
                      filterOption: (input, option) =>
                        JSON.stringify(option?.label).toLowerCase().includes(input.toLowerCase()),
                    }}
                    request={async ({ iteration }) => {
                      if (!iteration) return [];
                      try {
                        const result = await queryTask(iteration);
                        const { code, data } = result;
                        if (code === 200000) {
                          return data.map(({ id, name, demandName }: any) => ({
                            label: (
                              <Tooltip
                                placement="left"
                                overlayStyle={{ maxWidth: 480 }}
                                title={
                                  <>
                                    {demandName}
                                    <br />
                                    {name}
                                  </>
                                }
                              >
                                <p style={{ marginBottom: 0 }}>{demandName}</p>
                                <p style={{ marginBottom: 0, color: '#666' }}>{name}</p>
                              </Tooltip>
                            ),
                            value: JSON.stringify({ id, name, demandName }),
                          }));
                        }
                        return [];
                      } catch (error) {
                        return [];
                      }
                    }}
                  />
                );
              }}
            </ProFormDependency>
          </Space>
        </Form.Item>
      </ProForm.Group>

      <BarTitle>选择分支</BarTitle>
      <ProForm.Group>
        <ProFormDependency name={['taskInfo']}>
          {({ taskInfo: dependTaskInfo }) => {
            return (
              <ProFormSelect
                name="appInfo"
                label="应用服务"
                width="sm"
                showSearch
                disabled={!dependTaskInfo}
                debounceTime={300}
                placeholder="请选择服务"
                required
                dependencies={['projectInfo', 'taskInfo']}
                fieldProps={{
                  filterOption: (input, option) =>
                    JSON.stringify(option?.label).toLowerCase().includes(input.toLowerCase()),
                }}
                request={async ({ projectInfo, taskInfo, keyWords }) => {
                  if (!projectInfo || !taskInfo) return [];
                  try {
                    const { id: projectId } = JSON.parse(projectInfo);
                    const { id: taskId } = JSON.parse(taskInfo);
                    const result = await queryApps(projectId, taskId, keyWords);
                    return result.map((item: any) => ({
                      label: `${item.appName}(${item.appCode})`,
                      value: JSON.stringify(item),
                    }));
                  } catch (error) {
                    return [];
                  }
                }}
              />
            );
          }}
        </ProFormDependency>
        <ProFormDependency name={['appInfo']}>
          {({ appInfo: dependAppInfo }) => {
            return (
              <ProFormSelect
                name="branchInfo"
                label="选择分支"
                width="sm"
                disabled={!dependAppInfo}
                debounceTime={300}
                placeholder="请选择分支"
                required
                dependencies={['taskInfo', 'appInfo']}
                fieldProps={{
                  filterOption: (input, option) =>
                    JSON.stringify(option?.label).toLowerCase().includes(input.toLowerCase()),
                }}
                request={async ({ taskInfo, appInfo }) => {
                  if (!taskInfo || !appInfo) return [];
                  try {
                    const { projectId, appId } = JSON.parse(appInfo);
                    const { id: taskId } = JSON.parse(taskInfo);
                    const result = await queryBranch(projectId, taskId, appId);
                    return result.map((item: any) => ({
                      label: `${item.branchName}`,
                      value: JSON.stringify(item),
                    }));
                  } catch (error) {
                    return [];
                  }
                }}
              />
            );
          }}
        </ProFormDependency>
        <ProFormDependency name={['branchInfo']}>
          {({ branchInfo: dependBranchInfo }) => {
            return (
              <Button
                disabled={!dependBranchInfo}
                type="primary"
                style={{ marginTop: 30 }}
                onClick={handleAddBranch}
              >
                添加
              </Button>
            );
          }}
        </ProFormDependency>
      </ProForm.Group>
      <Form.Item label="关联需求" required style={{ margin: 0, marginBottom: 30 }}>
        <BranchTable
          dataSource={branchList}
          showOptions={true}
          onDelete={(record: any) => {
            setBranchList(branchList.filter((item: any) => item.id !== record.id));
          }}
        />
      </Form.Item>

      <BarTitle>审核信息</BarTitle>
      <ProForm.Group>
        <ProFormSelect
          name="moderator"
          label="审核人"
          width="sm"
          placeholder="请选择审核人"
          rules={[{ required: true, message: '请选择' }]}
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
    </DrawerForm>
  );
};
