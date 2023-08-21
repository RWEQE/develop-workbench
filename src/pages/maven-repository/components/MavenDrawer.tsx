import React, { useState, useCallback, useEffect, useRef } from 'react';
import ProForm, { 
  DrawerForm, 
  ProFormRadio, 
  ProFormText, 
  ProFormUploadButton, 
  ProFormDependency,
  ProFormTextArea,
  ProFormCheckbox,
} from '@ant-design/pro-form';
import type { ProFormInstance } from '@ant-design/pro-form';
import { Button, Row, Col, message, Spin, Popover, Card, Tabs } from 'antd';
import { PlusOutlined, LinkOutlined, LoadingOutlined } from '@ant-design/icons';
import { BarTitle } from '@/components/BarTitle';
import { CommonAlert } from '@/components/CommonAlert';
import { ViewReference } from './ViewReference';
import { queryEnvEnum, uploadMaven } from '@/services/maven-repository';
import { EnumItem, codeMap, MavneItem } from '@/interfaces/maven-repository';
import styless from '../index.less';
import globalStyless from '@/global.less';
import imageuploader from '../utils/index';
import { useModel } from 'umi';

interface MavenDrawerProp {
  type: 'create' | 'view' | 'edit',
  mavenItem?: MavneItem;
  reload?: () => void;
}

const MavenDrawer: React.FC<MavenDrawerProp> = ({
  type,
  mavenItem,
  reload,
}) => {

  const [envList, setEnvList] = useState<EnumItem[]>([]); // envList
  const [envLoading, setEnvLoading] = useState<boolean>(false); // loading
  const [xmlStr, setXmlStr] = useState<string>(); // 预览内容
  const formRef = useRef<ProFormInstance>(); // 表单ref
  const [tabKey, setTabKey] = useState<string>('fileInfo')
  const readOnly = type == 'view';
  const projectId = useModel('@@initialState')?.initialState?.projectList![0]?.id; // 当前用户的 首个项目id

  useEffect(() => {
    if(envList.length > 0 && mavenItem?.id) {
      setXmlStr(getPreviewXMLContent(mavenItem))
    }
  }, [envList, mavenItem])

  // 弹窗visible回调
  const onVisibleChange = useCallback((value: boolean) => {
    if(value) {
      loadEnvList();
    } else {
      formRef.current?.resetFields();
      setEnvList([]);
      setXmlStr(undefined);
      setEnvLoading(false);
    }
  }, [])

  // 表单的值发生了变化
  const onValuesChange = useCallback((changedValues: any) => {
    const { env } = changedValues;
    const currentValues = formRef.current?.getFieldsValue();
    if(env && currentValues.version) {
      formRef.current?.validateFields(['version'])
    }
  }, [])

  // 获取环境信息
  const loadEnvList = useCallback(() => {
    setEnvLoading(true)
    queryEnvEnum().then(({data}) => {
      setEnvList(data)
    }).finally(() => setEnvLoading(false))
  }, [])

  // 获取 环境名称
  const getEnvName = useCallback((code) => {
    return envList.find(item => item.code == code)?.desc || ''
  }, [envList])

  // 获取预览信息
  const getPreviewXMLContent = useCallback((data: any) => {
    if (data.id) {
      return `环境信息：${getEnvName(data.env)}\n
环境地址：${data.fileUrl}\n
上传信息：\n
<dependency>
  <groupId>${data.groupId}</groupId>
  <artifactId>${data.artifactId}</artifactId>
  <version>${data.version}</version>
</dependency>`;
    } else {
      return `环境信息：${getEnvName(data.env)}\n
上传信息：\n
<dependency>
  <groupId>${data.groupId}</groupId>
  <artifactId>${data.artifactId}</artifactId>
  <version>${data.version}</version>
</dependency>`;
    }
  }, [envList]);

  // 点击预览
  const onPreview = useCallback(() => {
    formRef.current?.validateFields().then(
      (values) => {
        setXmlStr(getPreviewXMLContent(values))
      }
    )
  }, [formRef, envList])

  // 自定义 上传 请求
  const onFileUpload = useCallback((options, fileType: 'jar' | 'pom' | 'resource' ) => {
    const { onSuccess, file } = options;
    imageuploader.post({
      url: `/api/maven-manager/v1/projects/${projectId || 0}/file`,
      file,
    })
      .then(
        ({data}: any) => {
          const { fileName, url } = data;
          if(fileType == 'jar') {
            formRef.current?.setFieldsValue({
              jarFileName: fileName,
              jarFileUrl: url,
            })
          } else if (fileType == 'pom') {
            formRef.current?.setFieldsValue({
              pomFileName: fileName,
              pomFileUrl: url,
            })
          } else if (fileType == 'resource') {
            formRef.current?.setFieldsValue({
              resourceFileName: fileName,
              resourceFileUrl: url,
            })
          }
          onSuccess(file, url);
        },
        (e: any) => {
          console.log("上传失败:" + JSON.stringify(e || ""));
        }
      )
  }, [])

  return (
    <div>
      <DrawerForm
        title={type == 'create' ? '上传文件' : '查看引用'}
        width={960}
        formRef={formRef}
        trigger={
          type == 'create' ? (
            <Button type="primary" icon={<PlusOutlined />}>
              上传
            </Button>) : 
              type == 'edit' ? <a>编辑</a> : 
                <a>引用查看</a>
        }
        initialValues={ mavenItem?.id ? mavenItem : { env: 5, fileType: [1, 2] }}
        onVisibleChange={onVisibleChange}
        onValuesChange={onValuesChange}
        autoFocusFirstInput
        onFinish={async (values) => {
          if(type == 'view') {
            return true;
          }
          try {
            const { fileType } = values;
            await uploadMaven({
              ...values,
              projectId: projectId || 0,
              uploadJar: fileType.includes(1),
              uploadPom: fileType.includes(2),
              uploadResource: fileType.includes(3),
              fileType: undefined,
            })
            message.success('上传成功！');
            reload?.();
            return true
          } catch (error) {
            return false
          }
        }}
      >
        {
          type == 'view' && (
            <Tabs activeKey={tabKey} onChange={setTabKey}>
              <Tabs.TabPane tab="文件信息" key="fileInfo" />
              <Tabs.TabPane tab="查看引用" key="viewReference">
                <ViewReference dataInfo={mavenItem!} />
              </Tabs.TabPane>
            </Tabs>
          )
        }
        {
          tabKey == 'fileInfo' && (
            <div>
              <CommonAlert />
              {
                type == 'view' && (
                  <>
                    <BarTitle>
                      基本信息
                    </BarTitle>
                    <ProForm.Group>
                      <ProFormText
                        name='createByName'
                        label='操作人'
                        width="lg"
                        disabled={readOnly}
                      />
                      <ProFormText
                        name='creationDate'
                        label='上传时间'
                        width="lg"
                        disabled={readOnly}
                      />
                    </ProForm.Group>
                    <Row>
                      <Col span={24}>
                        <ProFormText
                          name='fileUrl'
                          label={(
                            <>
                              地址
                              <Button
                                type='link'
                                target='_blank'
                                href={mavenItem?.fileUrl}
                                icon={<LinkOutlined />}
                              >跳转</Button>
                            </>
                          )}
                          disabled={readOnly}
                        />
                      </Col>
                    </Row>
                  </>
                )
              }
              <BarTitle>
                <Row justify='space-between'>
                  <Row align='middle'>
                    环境信息
                    <span className={styless.thinText}>
                      (公共release库：
                      <span className={globalStyless.dangerColor}>
                        同一版本仅允许上传一次。如果有变更请递增版本号发布新的release版本。
                      </span>)
                    </span>
                  </Row>
                  <Popover 
                    content={(
                      <>
                        <p><a><i><b>SNAPSHOT 与 RELEASE的区别</b></i></a></p>
                        <p>(1) snapshot 版本是可以重复上传覆盖更新的, 我们不建议使用该方式进行版本管理</p>
                        <p>(2) snapshot 版本是区分环境的, 如果您坚持使用该版本, 请务必保证各环境版本文件的一致性</p>
                        <p>(3) release 版本是不能重复上传更新的, 变更需要递增版本号, 详情查看： 
                          <a 
                            href='https://doc.weixin.qq.com/doc/w3_ABoApgbqADI4zB1tIE3TEycNENB2a?scode=AHEAxAeGABE3SClKFBAMUAIgb7AAk'
                            target={'_blank'}
                          >版本号变更细则</a>
                        </p>
                        <div>(4) release 版本是不区分环境的, 只需要上传到“公共release环境”即可, 在任何编译环境都可以引用到您发布的文件</div>
                      </>
                    )}
                    placement='bottomRight'
                  >
                    <Button type='link'>
                      <b><i>SNAPSHOT 与 RELEASE的区别</i></b>
                    </Button>
                  </Popover>
                </Row>
              </BarTitle>
              <Spin 
                indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} 
                spinning={envLoading}
              >
                <ProFormRadio.Group
                  name='env'
                  label='上传环境'
                  disabled={readOnly}
                  options={
                    envList?.map((env: EnumItem) => {
                      const repositoryType = [1, 2, 3, 4].includes(env.code) ? (
                        <div className={styless.repositoryTitle}>库类型：Snapshot库</div>
                      ) : (
                        <div className={styless.repositoryTitle}>库类型：Release库</div>
                      );
                      return {
                        label: (
                          <span>
                            {env.desc}
                            {codeMap[env.code] || " "}
                            {repositoryType}
                          </span>
                        ),
                        value: env.code,
                      }
                    })
                  }
                />
              </Spin>
              <BarTitle>
                GAV定义源
              </BarTitle>
              <div className={styless.gavSourceBox}>
                <div>
                  <ProFormText
                    name="groupId"
                    width="lg"
                    label="Group ID"
                    placeholder="请输入Group ID"
                    disabled={readOnly}
                    rules={[
                      {
                        required: true,
                        message: "请输入Group ID",
                      },
                      {
                        pattern: /^[0-9A-Za-z_.-]*$/,
                        message: "只允许使用字母、数字、下划线 (_)、连字符 (-) 和点 (.)",
                      },
                    ]}
                  />
                  <ProFormText
                    name="artifactId"
                    width="lg"
                    label="Artifact ID"
                    placeholder="请输入Artifact ID"
                    disabled={readOnly}
                    rules={[
                      {
                        required: true,
                        message: "请输入Artifact ID",
                      },
                      {
                        pattern: /^[0-9A-Za-z_.-]*$/,
                        message: "只允许使用字母、数字、下划线 (_)、连字符 (-) 和点 (.)",
                      },
                    ]}
                  />
                  <ProFormDependency name={['env']}>
                    {({env}) => {
                      return (
                        <ProFormText
                          name="version"
                          width="lg"
                          label={(
                            <div>
                              版本
                              <div className={styless.repositoryTitle}>
                                版本命名规则:
                                1、Snapshot库：以“x.y.z-SNAPSHOT”命名 <br />
                                2、Release库：建议以“x.y.z-RELEASE”命名
                              </div>
                            </div>
                          )}
                          placeholder="请输入版本号"
                          disabled={readOnly}
                          rules={[
                            {
                              required: true,
                              message: "请输入版本号",
                            },
                            {
                              pattern: /^[0-9A-Za-z_.-]*$/,
                              message: "只允许使用字母、数字、下划线 (_)、连字符 (-) 和点 (.)",
                            },
                            {
                              validator: async (rule, value) => {
                                const envName = getEnvName(env);
                                const isReleaseError = env === 5 && value && value.endsWith("SNAPSHOT");
                                const isSnapshotError = env !== 5 && value && !value.endsWith("SNAPSHOT");
                                if (isReleaseError) {
                                  throw new Error('release环境的版本不能以SNAPSHOT结尾');
                                } else if (isSnapshotError) {
                                  throw new Error(`${envName}的版本需要SNAPSHOT结尾`);
                                }
                              },
                            }
                          ]}
                        />
                      )
                    }}
                  </ProFormDependency>
                </div>
                <Card className={styless.gavTipsCard}>
                  <>
                    <div><b>GAV定义源说明：</b></div>
                    <div className={styless.repositoryTitle}>
                      <div>示例字段展示如下：</div>
                      <div>&ensp;{'<dependency>'}</div>
                      <div>&emsp;{'<groupId>com.yonghui</groupId>'}</div>
                      <div>&emsp;{'<artifactId>community-api</artifactId>'}</div>
                      <div>&emsp;{'<version>1.0-SNAPSHOT</version>'}</div>
                      <p>&ensp;{'</dependency>'}</p>
                      <div>则输入GAV定义源如下：</div>
                      <div>&emsp;Group ID：com.yonghui</div>
                      <div>&emsp;Artifact ID：community-api</div>
                      <div>&emsp;version：1.0-SNAPSHOT</div>
                    </div>
                  </>
                </Card>
              </div>
              <ProFormCheckbox.Group
                name="fileType"
                width="lg"
                label={(
                  <div>
                    <span>上传文件类型:</span>
                    <br />
                    <div className={styless.repositoryTitle}>
                      1、本地打包类型为jar时，
                      <span className={globalStyless.dangerColor}>
                        install会在本地仓库产生一个jar及pom文件, 请将jar及pom同时上传
                      </span>
                      <br />
                      2、本地打包类型为pom时，
                      <span className={globalStyless.dangerColor}>
                        install会在本地仓库产生一个pom文件, 请将pom上传
                      </span>
                      <br />
                      <span className={globalStyless.dangerColor}>
                        注意：源码上传仅支持单独上传，或者和jar文件同时上传！！！源码包的后缀需要以“-sources.jar”结尾！！！
                      </span>
                    </div>
                  </div>
                )}
                disabled={readOnly}
                options={[
                  {label: 'jar文件', value: 1},
                  {label: 'pom文件', value: 2},
                  {label: '源码上传', value: 3},
                ]}
                rules={[{required: true, message: '请选择上传文件类型'}]}
              />
              <ProFormDependency name={['fileType']}>
                {({ fileType }) => (
                  <>
                    <Row gutter={24}>
                      {
                        fileType?.includes(1) && (
                          readOnly ? (
                            <Col span={24}>
                              <ProFormText
                                name='jarFileUrl'
                                label={(
                                  <>
                                    jar文件
                                    <Button
                                      type='link'
                                      target='_blank'
                                      href={mavenItem?.jarFileUrl}
                                      icon={<LinkOutlined />}
                                    >下载</Button>
                                  </>
                                )}
                                disabled={readOnly}
                              />
                            </Col>
                          ) : (
                            <Col span={12}>
                              <ProFormUploadButton
                                name="jarFile"
                                label="上传文件(jar文件)"
                                title="上传"
                                max={1}
                                fieldProps={{
                                  name: 'file',
                                  accept: 'application/x-java-archive,application/java-archive',
                                  customRequest: (optiosn) => onFileUpload(optiosn, 'jar'),
                                }}
                                rules={[{required: true, message: '请上传jar文件'}]}
                              />
                              <ProFormText name='jarFileName' hidden />
                              <ProFormText name='jarFileUrl' hidden />
                            </Col>
                          )
                        )
                      }
                      {
                        fileType?.includes(2) && (
                          readOnly ? (
                            <Col span={24}>
                              <ProFormText
                                name='pomFileUrl'
                                label={(
                                  <>
                                    pom文件
                                    <Button
                                      type='link'
                                      target='_blank'
                                      href={mavenItem?.pomFileUrl}
                                      icon={<LinkOutlined />}
                                    >下载</Button>
                                  </>
                                )}
                                disabled={readOnly}
                              />
                            </Col>
                          ) : (
                            <Col span={12}>
                              <ProFormUploadButton
                                name="pomFile"
                                label="上传文件(pom文件)"
                                title="上传"
                                max={1}
                                fieldProps={{
                                  name: 'file',
                                  accept: '.pom',
                                  customRequest: (optiosn) => onFileUpload(optiosn, 'pom'),
                                }}
                                rules={[{required: true, message: '请上传pom文件'}]}
                              />
                              <ProFormText name='pomFileName' hidden />
                              <ProFormText name='pomFileUrl' hidden />
                            </Col>
                          )
                        )
                      }
                      {
                        fileType?.includes(3) && (
                          readOnly ? (
                            <Col span={24}>
                              <ProFormText
                                name='resourceFileUrl'
                                label={(
                                  <>
                                    源码文件
                                    <Button
                                      type='link'
                                      target='_blank'
                                      href={mavenItem?.resourceFileUrl}
                                      icon={<LinkOutlined />}
                                    >下载</Button>
                                  </>
                                )}
                                disabled={readOnly}
                              />
                            </Col>
                          ) : (
                            <Col span={12}>
                              <ProFormUploadButton
                                name="resourceFile"
                                label="上传文件(源码包的后缀需要以“-sources.jar”结尾)"
                                title="上传"
                                max={1}
                                fieldProps={{
                                  name: 'file',
                                  accept: 'application/x-java-archive,application/java-archive',
                                  customRequest: (optiosn) => onFileUpload(optiosn, 'resource'),
                                }}
                                rules={[{required: true, message: '请上传源码文件(源码包的后缀需要以“-sources.jar”结尾)'}]}
                              />
                              <ProFormText name='resourceFileName' hidden />
                              <ProFormText name='resourceFileUrl' hidden />
                            </Col>
                          )
                        )
                      }
                    </Row>
                  </>
                )}
              </ProFormDependency>
              <div className={styless.gavSourceBox}>
                <div>
                  <ProFormTextArea
                    name="description"
                    label="变更描述"
                    placeholder="请输入变更描述，后续可修改该变更描述。"
                    disabled={readOnly}
                    fieldProps={{
                      autoSize: {minRows: 10},
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
                  // bodyStyle={{paddingTop: 12}}
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
              <BarTitle>
                预览
              </BarTitle>
              <Button onClick={onPreview} disabled={readOnly}>预览</Button>
              {xmlStr && (
                <pre key="dd" className={styless.preview}>
                  {xmlStr}
                </pre>
              )}
            </div>
          )
        }
      </DrawerForm>
    </div>
  )
}

export { MavenDrawer };