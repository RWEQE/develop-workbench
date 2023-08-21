import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Drawer, 
  Button, 
  Form, 
  Alert, 
  Row, 
  Col, 
  Input, 
  Radio, 
  Collapse, 
  Tooltip,
  Checkbox,
  Typography,
  Select,
  Spin,
  message,
  Empty,
  ConfigProvider,
} from '@middle/ui';
import { Table } from 'antd';
import { QuestionCircleOutlined, DeleteOutlined } from '@ant-design/icons';
const { Panel } = Collapse;
const { Text } = Typography;
const CheckboxGroup = Checkbox.Group;
import { BarTitle } from '@/components/BarTitle';
import { BranchTagSelect } from '@/components/BranchTagSelect';
import { MavenBuildTips } from './MavenBuildTips';
import { 
  checkAppExecute, 
  queryAppBranchModules, 
  queryInstanceEnvs, 
  queryGlobalVariable,
  refreshAppBranchModules,
  saveAppBranchModules,
  executeGitlabCi,
  queryUserRoleByProject,
  getDeployAllowTime,
} from '@/services/develp-workbench';
import { 
  IApplicaitonList, 
  MavenEnvsEnum, 
  AppExecuteCheckProp, 
  IDeployModule,
  IImmutableVariable,
  AutoDeployEnvProp,
} from '@/interfaces/develop-workbench';
import { PromiseAllSettledRes } from '@/interfaces/common';
import { useModel } from 'umi';
import { getBranchNameType, getBranchRealName } from '@/pages/develop-workbench/utils';
import styless from './index.less';

interface BuildApplicationProp {
  visible: boolean;
  appInfo: IApplicaitonList;
  onTableReload: () => void;
  onCancel: () => void;
}

const BuildApplication: React.FC<BuildApplicationProp> = ({
  visible,
  appInfo,
  onTableReload,
  onCancel,
}) => {

  const [deployModules, setDeployModules] = useState<Array<IDeployModule>>([]); // deploy 模块
  const [executeCheck, setExecuteCheck] = useState<AppExecuteCheckProp>(); // maven 环境
  const [instanceEnvs, setInstanceEnvs] = useState<Array<AutoDeployEnvProp>>([]); // 自动部署 环境
  const [deployLoading, setDeployLoading] = useState<boolean>(false); // deploy 模块loading
  const [mavenTips, setMavenTips] = useState(false); // tip提示信息 visible
  const [moduleCollapseKey, setModuleCollapseKey] = useState<Array<string>>([]); // deploy 模块 手风琴 activeKey
  const [autoCollapseKey, setAutoCollapseKey] = useState<Array<string>>([]); // 自动部署环境 手风琴 activeKey
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false) // 提交按钮的loading，避免多次点击
  const [mavenPermission, setMavenPermission] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { id } = useModel('@@initialState')?.initialState?.currentUser!;

  useEffect(() => {
    if(visible && appInfo) {
      form.setFieldsValue(appInfo)
      loadDeployAllowTime();
      loadEnvByRole();
      loadAppExecuteCheck();
      loadGlobalVariable();
    }
  }, [visible, appInfo])

  // 获取全部 初始化信息
  const loadEnvByRole = () => {
    Promise.allSettled([
      loadInstanceEnvs(),
      loadUserRoleByProject(),
    ]).then(
      ([instanceEnvRes, userRoleRes]: Array<PromiseAllSettledRes>) => {
        const instanceEnvs = instanceEnvRes?.value || []
        const roleCodeList = userRoleRes?.value || []
        const hasTestRole = roleCodeList.some((item: string) => [ // 是否有测试角色
          'role/project/custom/project-test-leader',
          'role/project/custom/project-test',
          'role/project/custom/project-test-developer',
        ].indexOf(item) > -1)
        // 有权限的 自动部署环境
        const hasPermissionInstanceEnvs = instanceEnvs.filter((item: AutoDeployEnvProp) =>  
          !['sit', 'test'].includes(item.envType) || hasTestRole
        )
        if(hasPermissionInstanceEnvs.length > 0) {
          setAutoCollapseKey(['1'])
        }
        setInstanceEnvs(hasPermissionInstanceEnvs)
      }
    )
  }

  // 验证并获取maven环境
  const loadAppExecuteCheck = useCallback(() => {
    checkAppExecute(appInfo.projectId, appInfo.id).then(
      (res) => {
        setExecuteCheck(res)
      }
    )
  }, [appInfo])

  // 获取需要隐藏模块的时间
  const loadDeployAllowTime = useCallback(() => {
    getDeployAllowTime().then(
      (res) => {
        const time = Object.values(res)[0]
        const hasPermission = new Date() < new Date(time as string)
        setMavenPermission(hasPermission)
      }
    )
  }, [])

  // 查询 项目内用户角色来判断 是否显示 自动部署环境 sit 部分
  const loadUserRoleByProject = useCallback(() => {
    return queryUserRoleByProject(appInfo.projectId, id).then(
      (res) => {
        const roleList = res?.map((item: any) => item.code) || []
        return roleList
      }
    )
  }, [appInfo, id])

  // 获取 应用下分支 对应的 deploy模块
  const loadAppBranchModules = useCallback((branch: string) => {
    if(!branch) {
      form.setFieldsValue({
        modules: undefined
      })
      setDeployModules([]);
      return;
    }
    const branchType = getBranchNameType(getBranchRealName(branch));
    const isProd = (branch?.split('-')[0] == 'tag') || ['release', 'master'].includes(branchType);
    const initialEnv = /test|sit/.test(branch) ? "sit" : 
      /uat/.test(branch) ? "uat" : isProd ? "prod" : "dev";
    form.setFieldsValue({
      mavenEnv: initialEnv,
    })
    setDeployLoading(true)
    queryAppBranchModules(
      appInfo.id, 
      getBranchRealName(branch),
      branch.split('-')[0],
    ).then(
      ({ data }) => {
        form.setFieldsValue({
          modules: data.filter((module: IDeployModule) => module.deploy).map((module: IDeployModule) => module.module)
        })
        if(data?.length > 0) {
          setModuleCollapseKey(['1'])
        } else {
          setModuleCollapseKey([])
        }
        setDeployModules(data)
      }
    ).finally(
      () => setDeployLoading(false)
    )
  }, [appInfo])

  // 刷新 获取 应用下分支 对应的 deploy模块
  const onRefreshModules = useCallback(() => {
    form.validateFields(['branch']).then(
      ({ branch }) => {
        setDeployLoading(true)
        refreshAppBranchModules(
          appInfo.projectId,
          appInfo.id, 
          getBranchRealName(branch),
          branch.split('-')[0],
        ).then(
          (data) => {
            form.setFieldsValue({
              modules: data.filter((module: IDeployModule) => module.deploy).map((module: IDeployModule) => module.module)
            })
            if(data?.length > 0) {
              setModuleCollapseKey(['1'])
            } else {
              setModuleCollapseKey([])
            }
            setDeployModules(data)
          }
        ).finally(
          () => setDeployLoading(false)
        )
      }
    )
  }, [appInfo])

  // 保存 获取 应用下分支 对应的 deploy模块
  const onSaveModules = useCallback(() => {
    form.validateFields(['branch', 'modules']).then(
      ({ branch, modules }) => {
        saveAppBranchModules(
          appInfo.projectId,
          appInfo.id, 
          getBranchRealName(branch),
          branch.split('-')[0],
          deployModules?.map(module => {
            return {
              ...module,
              deploy: !!modules?.includes(module.module),
            }
          }),
        ).then(
          (data) => {
            message.success('需要deploy的模块保存成功!')
          }
        )
      }
    )
  }, [appInfo, deployModules])

  const disabledDeployModules = useCallback((value: string) => {
    return value.endsWith('-server') || value.endsWith('-facade')
  }, [])

  // 模块中 可选中的模块的长度
  const enableModulesLength = useMemo(() => {
    const result = deployModules?.filter(
      (module: IDeployModule) => !disabledDeployModules(module.module)
    )?.length || 0
    return result
  }, [deployModules])

  // 全选 deploy模块，
  const onCheckAllChange = useCallback((checked: boolean) => {
    if(checked) {
      form.setFieldsValue({
        modules: deployModules.filter(
          (module: IDeployModule) => !disabledDeployModules(module.module)
        ).map((module: IDeployModule) => module.module)
      })
    } else {
      form.setFieldsValue({
        modules: undefined,
      })
    }
  }, [deployModules])

  // 项目下查询有正在运行实例的环境
  const loadInstanceEnvs = useCallback(() => {
    return queryInstanceEnvs(appInfo.projectId, appInfo.id).then(
      (list) => {
        return list.filter((item: any) => ['dev', 'test'].includes(item.envType))
      }
    )
  }, [appInfo])

  // 查询已有全局变量
  const loadGlobalVariable = useCallback(() => {
    queryGlobalVariable(appInfo.projectId, appInfo.id).then(
      (res) => {
        const immutableContent = JSON.parse(res.immutableVariables || '{}')
        const dynamicContent = JSON.parse(res.dynamicVariables || '{}')
        const newContent = []
        for (const [key, value] of Object.entries(immutableContent || {})) {
          newContent.push({
            rowKey: `immutable-${key}`,
            key, 
            value,
          })
        }
        for (const [key, value] of Object.entries(dynamicContent || {})) {
          newContent.push({
            rowKey: `dynamic-${key}`,
            key, 
            value: (value as any)?.defaultValue,
            option: (value as any)?.values,
          })
        }
        form.setFieldsValue({
          globalVariableList: newContent,
        })
      }
    )
  }, [appInfo])

  // 增加一条自定义变量
  const onAddCustomVariable = useCallback(() => {
    const customVariableList = form.getFieldValue('customVariableList') || [];
    const newList = JSON.parse(JSON.stringify(customVariableList))
    newList.push({
      key: '',
      value: ''
    })
    form.setFieldsValue({
      customVariableList: newList,
    })
  }, [])

  // 增加一条自定义变量
  const onDeleteCustomVariable = useCallback((index: number) => {
    const customVariableList = form.getFieldValue('customVariableList') || [];
    const newList = JSON.parse(JSON.stringify(customVariableList))
    newList.splice(index, 1)
    form.setFieldsValue({
      customVariableList: newList,
    })
  }, [])

  // 提交
  const onSubmit = useCallback(() => {
    form.validateFields().then(
      (values) => {
        setConfirmLoading(true)
        const { customVariableList, globalVariableList, mavenEnv, branch, modules, autoDeployEnvs } = values;
        const customVariableObj = {}
        const globalVariableObj = {}
        customVariableList?.forEach((item: IImmutableVariable) => {
          customVariableObj[item.key] = item.value
        })
        globalVariableList?.forEach((item: IImmutableVariable) => {
          globalVariableObj[item.key] = item.value
        })
        const params = {
          appId: appInfo.id,
          checkCi: false,
          customizedVariables: customVariableObj,
          globalVariables: globalVariableObj,
          pipelineReqDTO: {
            mavenEnv,
            autoDeployEnvs,
            modules: mavenPermission ? deployModules?.map(module => {
              return {
                ...module,
                deploy: !!modules?.includes(module.module),
              }
            }) : null,
            ref: getBranchRealName(branch),
          }
        }
        executeGitlabCi(appInfo.projectId, params).then(
          (res) => {
            message.success('执行成功！');
            handleClose();
            onTableReload();
          }
        ).finally(() => setConfirmLoading(false))
      }
    )
  }, [appInfo, deployModules, mavenPermission])

  // 关闭弹窗
  const handleClose = useCallback(() => {
    form.resetFields();
    setDeployModules([]);
    setExecuteCheck(undefined);
    setConfirmLoading(false);
    setInstanceEnvs([]);
    onCancel();
  }, [])

  return useMemo(() => {
    return (
      <Drawer
        visible={visible}
        width={1080}
        title={`构建应用"${appInfo?.name}"`}
        onClose={handleClose}
        footer={(
          <Row justify='space-between'>
            <Button onClick={handleClose}>取消</Button>
            <Button type='primary' loading={confirmLoading} onClick={onSubmit}>
              提交
            </Button>
          </Row>
        )}
      >
        <Alert
          message="构建成功后将生成一个可部署的服务版本，您可以在部署工作台中部署或升级该版本，也可以在部署上线单中选择部署或升级该版本。"
          type="info"
        />
        <Form form={form} layout='vertical'>
          <BarTitle>基本信息</BarTitle>
          <Row gutter={24}>
            <Col span={6}>
              <Form.Item name='projectName' label='项目名称'>
                <Input
                  placeholder='这是一个项目名称'
                  appearance='edit'
                  readOnly
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name='projectCode' label='项目编码'>
                <Input 
                  placeholder='这是一个项目编码' 
                  appearance='edit' 
                  readOnly 
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name='name' label='应用名称'>
                <Input 
                  placeholder='这是一个应用名称' 
                  appearance='edit' 
                  readOnly 
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name='code' label='应用编码'>
                <Input 
                  placeholder='这是一个应用编码' 
                  appearance='edit'
                  readOnly 
                />
              </Form.Item>
            </Col>
          </Row>
          <BarTitle>执行分支</BarTitle>
          <Row>
            <Col span={9}>
              <BranchTagSelect
                name='branch'
                label='分支或tag'
                required='请选择分支或tag'
                tooltip='分支名不能包含/和下划线等特殊符号'
                projectId={appInfo?.projectId}
                appId={appInfo?.id}
                sortBranchTag={true}
                onChange={(value) => loadAppBranchModules(value)}
              />
            </Col>
          </Row>
          {
            executeCheck?.isMavenProject && (
              <>
                <BarTitle>Maven项目构建定义</BarTitle>
                <Form.Item
                  noStyle
                  shouldUpdate={(pre, next) => pre.branch !== next.branch}
                >
                  {({getFieldValue}) => {
                    const branch = getFieldValue('branch');
                    const branchType = getBranchNameType(getBranchRealName(branch));
                    const isProdBranch = branchType == 'master' || branchType == 'release' || branch?.split('-')[0] == 'tag'
                    return (
                      <Form.Item
                        name='mavenEnv'
                        label={(
                          <div>
                            指定编译环境
                            &ensp;
                            <Tooltip title='定义Maven项目构建时使用的仓库，构建产生的jar/pom将影响使用该环境的其他应用服务'>
                              <QuestionCircleOutlined />
                            </Tooltip>
                            &ensp;
                            <a onClick={() => setMavenTips(true)}>查看详情</a>
                            &ensp;
                            <span style={{color: 'rgba(0,0,0,.45)'}}>
                              (仅master、release分支和tag可以选择生产环境)
                            </span>
                          </div>
                        )}
                        style={{marginBottom: 16}}
                        rules={[{required: true, message: '请指定编译环境'}]}
                      >
                        <Radio.Group>
                          {
                            executeCheck?.mavenEnvs?.map(mavenEnv => (
                              <Radio 
                                key={mavenEnv}
                                value={mavenEnv}
                                disabled={
                                  MavenEnvsEnum[mavenEnv]?.prodBranchDisabled && isProdBranch ||
                                  !MavenEnvsEnum[mavenEnv]?.prodBranchDisabled && !isProdBranch
                                }
                              >
                                {
                                  MavenEnvsEnum[mavenEnv]?.describe || mavenEnv
                                }
                              </Radio>
                            ))
                          }
                        </Radio.Group>
                      </Form.Item>
                    )
                  }}
                </Form.Item>
                {
                  executeCheck?.showDeployModules && mavenPermission && (
                    <Collapse
                      activeKey={moduleCollapseKey}
                      onChange={setModuleCollapseKey}
                    >
                      <Panel
                        header={(
                          <span>
                            指定需要deploy的模块
                            <span style={{fontSize: 12, color: 'rgba(0,0,0,.45)' }}>
                              (-server、-facade模块不可以当作二方包, 不能执行deploy)
                            </span>
                            &ensp;
                            <Tooltip 
                              title={(
                                <span>
                                  选中的模块构建成功后会将模块下产生的iar/pom/source文件同步到远程仓库中；点击刷新会以当前选中的分支/tag获取最新的模块信息;
                                  <div style={{ color: '#e86553'}}>
                                    如未点击保存按钮，则当前选中的模块仅本次构建有效！
                                    <a 
                                      href='http://public-service.confluence.gw.yonghui.cn/pages/viewpage.action?pageId=48406456' 
                                      target={'_blank'}
                                    >
                                      （查看详情及实例）
                                    </a>
                                  </div>
                                </span>
                              )}
                              overlayInnerStyle={{width: 500}}
                            >
                              <QuestionCircleOutlined />
                            </Tooltip>
                            &ensp;
                            <Button 
                              type='link' 
                              size='small' 
                              onClick={(e) => {
                                e.stopPropagation();
                                onRefreshModules()
                              }}
                            >
                              刷新
                            </Button>
                          </span>
                        )}
                        key="1"
                        extra={(
                          <Button 
                            type='primary' 
                            size='small' 
                            onClick={(e) => {
                              e.stopPropagation();
                              onSaveModules();
                            }}
                          >
                            保存
                          </Button>
                        )}
                      >
                        {
                          deployModules.length > 0 ? (
                            <Spin spinning={deployLoading}>
                              <Form.Item
                                noStyle
                                shouldUpdate={(pre, next) => pre.modules !== next.modules}
                              >
                                {({ getFieldValue }) => {
                                  const modules = getFieldValue('modules') || [];
                                  return (
                                    <Checkbox
                                      indeterminate={modules.length && modules.length < enableModulesLength}
                                      checked={modules.length === enableModulesLength}
                                      onChange={e => onCheckAllChange(e.target.checked)}
                                      style={{marginBottom: 16}}
                                    >
                                      全选
                                    </Checkbox>
                                  )
                                }}
                              </Form.Item>
                              <Form.Item name='modules' style={{marginBottom: 0}}>
                                <CheckboxGroup
                                  className={styless.fullWidth}
                                >
                                  <Row>
                                    {
                                      deployModules?.map((module, index) => (
                                        <Col
                                          key={`${module.module}-${index}`}
                                          span={6}
                                          style={{marginBottom: 16}}
                                        >
                                          <Checkbox
                                            className={styless.checkboxText}
                                            value={module.module}
                                            disabled={disabledDeployModules(module.module)}
                                          >
                                            <Text ellipsis={{ tooltip: module.module }}>
                                              {module.module}
                                            </Text>
                                          </Checkbox>
                                        </Col>
                                      ))
                                    }
                                  </Row>
                                </CheckboxGroup>
                              </Form.Item>
                            </Spin>
                          ) : (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                          )
                        }
                      </Panel>
                    </Collapse>
                  )
                }
              </>
            )
          }
          <BarTitle>自动部署环境</BarTitle>
          <Collapse 
            activeKey={autoCollapseKey}
            onChange={setAutoCollapseKey}
          >
            <Panel
              header={(
                <span>
                  部署环境&ensp;
                  <Tooltip 
                    title='服务在构建成功后将对以下选中环境自动部署最新版本，如果该应用已经在部署工作台对以下环境设置了自动部署规则，可以不用选择环境'
                    overlayInnerStyle={{width: 500}}
                  >
                    <QuestionCircleOutlined />
                  </Tooltip>
                </span>
              )}
              key="1"
            >
              {
                instanceEnvs?.length > 0 ? (
                  <Form.Item name='autoDeployEnvs' style={{marginBottom: 0}}>
                    <CheckboxGroup className={styless.fullWidth}>
                      <Row gutter={16}>
                        {
                          instanceEnvs?.map((instanceEnv: AutoDeployEnvProp) => (
                            <Col
                              span={6} 
                              style={{marginBottom: 16}}
                              key={instanceEnv.id}
                            >
                              <Checkbox 
                                className={styless.checkboxText}
                                value={instanceEnv.id}
                              >
                                <Text ellipsis={{ tooltip: `${instanceEnv.name}(编号:${instanceEnv.code})` }}>
                                  {instanceEnv.name}(编号:{instanceEnv.code})
                                </Text>
                              </Checkbox>
                            </Col>
                          ))
                        }
                      </Row>
                    </CheckboxGroup>
                  </Form.Item>
                ) : (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )
              }
            </Panel>
          </Collapse>
          <BarTitle>执行变量</BarTitle>
          <p><b>
            全局变量(在所有的作业中可以直接使用以下变量)
          </b></p>
          <ConfigProvider 
            renderEmpty={() => (<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{margin: '16px 0'}} />)}
          >
            <Form.Item name={'globalVariableList'} hidden />
            <Form.Item
              noStyle
              shouldUpdate={(pre, next) => pre.globalVariableList !== next.globalVariableList}
            >
              {({getFieldValue}) => {
                const globalVariableList = getFieldValue('globalVariableList');
                return (
                  <Table
                    rowKey={'rowKey'}
                    dataSource={globalVariableList}
                    columns={[
                      {
                        title: '全局变量的key',
                        dataIndex: 'key',
                        width: '50%',
                        render: (_, record, index ) => (
                          <Form.Item
                            name={['globalVariableList', index, 'key']}
                            className={styless.marginBottomNull}
                          >
                            <Input disabled />
                          </Form.Item>
                        )
                      },
                      {
                        title: '全局变量的value',
                        dataIndex: 'value',
                        width: '50%',
                        render: (_, record, index) => (
                          <Form.Item
                            name={['globalVariableList', index, 'value']}
                            className={styless.marginBottomNull}
                          >
                            {
                              record.option?.length ? (
                                <Select
                                  options={record.option.map((item: string) => {
                                    return {
                                      label: item,
                                      value: item,
                                    }
                                  })}
                                  allowClear={false}
                                />
                              ) : (
                                <Input disabled />
                              )
                            }
                          </Form.Item>
                        )
                      },
                    ]}
                    size='small'
                    pagination={false}
                  />
                )
              }}
            </Form.Item>
            <p style={{marginTop: '2rem'}}><b>
              自定义变量(自定义变量将覆盖全局变量的值)
            </b></p>
            <Form.Item name={'customVariableList'} hidden />
            <Form.Item
              noStyle
              shouldUpdate={(pre, next) => pre.customVariableList !== next.customVariableList}
            >
              {({getFieldValue}) => {
                const customVariableList = getFieldValue('customVariableList') || [];
                return (
                  <Table
                    rowKey={'id'}
                    dataSource={customVariableList}
                    columns={[
                      {
                        title: '自定义变量的key',
                        dataIndex: 'key',
                        width: '50%',
                        render: (_, record, index ) => (
                          <Form.Item
                            name={['customVariableList', index, 'key']}
                            className={styless.marginBottomNull}
                          >
                            <Input placeholder='请输入变量的名称' />
                          </Form.Item>
                        )
                      },
                      {
                        title: '自定义变量的value',
                        dataIndex: 'value',
                        width: '45%',
                        render: (_, record, index ) => (
                          <Form.Item
                            name={['customVariableList', index, 'value']}
                            className={styless.marginBottomNull}
                          >
                            <Input placeholder='请输入变量的值' />
                          </Form.Item>
                        )
                      },
                      {
                        title: '操作',
                        dataIndex: 'action',
                        width: '5%',
                        render: (_, record, index) => (
                          <DeleteOutlined 
                            className={styless.clickAbleIcon}
                            onClick={() => onDeleteCustomVariable(index)}
                          />
                        )
                      }
                    ]}
                    size='small'
                    pagination={false}
                  />
                )
              }}
            </Form.Item>
            <Button
              style={{marginTop: 12}}
              type='dashed'
              block
              onClick={onAddCustomVariable}
            >
              添加
            </Button>
          </ConfigProvider>
        </Form>
        <MavenBuildTips
          visible={mavenTips}
          onCancel={() => setMavenTips(false)}
        />
      </Drawer>
    )
  }, [
    visible, 
    executeCheck, 
    deployModules, 
    instanceEnvs, 
    deployLoading, 
    mavenPermission,
    confirmLoading,
    mavenTips, 
    moduleCollapseKey, 
    autoCollapseKey
  ])
}

export { BuildApplication }