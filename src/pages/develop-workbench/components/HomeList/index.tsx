import React, { useState, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Divider, 
  Space, 
  Tag, 
  Typography, 
  Tooltip, 
  ITableProps,
  Avatar,
  Table,
  Image,
} from '@middle/ui';
import TimeAgo from 'timeago-react';
import { QuestionCircleTwoTone } from '@ant-design/icons';
const { Paragraph } = Typography;
import { SearchForm } from '@/components/SearchForm';
import { BranchTagSelect } from '@/components/BranchTagSelect';
import { JumpDeployButton } from './JumpDeployButton';
import { CreateLabel } from '@/pages/develop-workbench/Modals/CreateLabel';
import { PipelineCiVariable } from '@/pages/develop-workbench/Modals/PipelineCiVariable';
import { queryAppPipelineList, createPipelineLabel, queryProjectEnvs } from '@/services/develp-workbench';
import {
  IApplicaitonList,
  IPipelineList,
  IStageProp,
  EnvDataProp,
}  from  '@/interfaces/develop-workbench/index';
import { renderStatus, renderCommit, renderStage } from './renderColumns';
import { getBranchRealName } from '@/pages/develop-workbench/utils';
import { useLocalStorageState } from 'ahooks';
import QRCode from 'qrcode.react';
import styless from './index.less';
import { message } from 'antd';

interface HomeListProp {
  curApp: IApplicaitonList;
}

export interface HomeListRef {
  reload?: () => void;
}

const HomeListRefComponent: React.ForwardRefRenderFunction<
  HomeListRef,
  HomeListProp
> = ({curApp}, ref) => {

  const [operationList, setOperationList] = useState<IPipelineList[]>([]); // 列表页 列表数据
  const [modalType, setModalType] = useState<'createLabel' | 'ciVariable'>(); // 弹窗类型
  const [pipelineInfo, setPipelineInfo] = useState<IPipelineList>(); // 某一条 流水线信息
  const [pageInfo, setPageInfo] = useState({page: 0, size: 10}); // 分页参数
  const [total, setTotal] = useState<number>(0); // 总数
  const [loading, setLoading] = useState<boolean>(false); // 表格 loading
  const [projectEnvs, setProjectEnvs] = useState<Map<string, EnvDataProp[]>>(new Map());
  const [refreh, setRefreh] = useState<boolean>(false);
  const [defaultAutoRefresh, setDefaultAutoRefresh] = useLocalStorageState<boolean>(
    'develop-pipeline-autorefresh',
    { defaultValue: true }
  );
  const [form] = Form.useForm();

  useEffect(() => {
    !document.hidden && curApp && loadAppPipelineList();
  }, [curApp, pageInfo, refreh])

  useEffect(() => {
    if(curApp?.projectId) {
      loadProjectEnvs();
    }
  }, [curApp])

  useImperativeHandle(
    ref,
    () => {
      return {
        reload: loadAppPipelineList,
      };
    },
    [curApp, pageInfo],
  );

  // 获取 列表页 应用的流水线列表数据
  const loadAppPipelineList = useCallback(() => {
    if(!curApp) {
      message.warning('请先选择应用！');
      return;
    }
    setLoading(true)
    const { branch, tagName } = form.getFieldsValue();
    queryAppPipelineList(
      curApp.projectId,
      {
        appId: curApp.id,
        page: pageInfo.page,
        size: pageInfo.size,
        branch: getBranchRealName(branch),
        tagName,
        branchType: branch?.split('-')[0],
      }
    ).then(
      ({ content, totalElements }) => {
        setOperationList(content);
        setTotal(totalElements);
      }
    ).finally(
      () => setLoading(false)
    )
  }, [curApp, pageInfo])

  // 获取项目环境
  const loadProjectEnvs = useCallback(() => {
    queryProjectEnvs(curApp.projectId).then(
      (envs) => {
        const envMap = new Map()
        envs?.forEach((item: EnvDataProp) => {
          const list = envMap.get(item.envType)
          if(envMap.has(item.envType)) {
            list.push(item)
          } else {
            envMap.set( `${item.envType}`, [item])
          }
        })
        setProjectEnvs(envMap);
      }
    )
  }, [curApp])

  // 表格 的 操作
  const onTableAction = useCallback(
    (type: 'release' | 'createLabel' | 'ciVariable', record: IPipelineList) => {
      const isDevelop = window.location.host.indexOf('kf-itwork') >= 0;
      switch(type) {
        case 'createLabel':
        case 'ciVariable':
          setModalType(type);
          setPipelineInfo(record);
          break;
        case 'release': 
          window.open(
            `http://${isDevelop ? 'kfitwork' : 'itwork'}.yonghui.cn/#/devops/app-release?` +
              `type=project&code=${curApp.projectCode}&id=${curApp.projectId}&name=${curApp.projectName}&organizationId=${curApp.organizationId}`
          )
          break;
        // case 'deploy':
        //   window.open(
        //     (isDevelop ? `http://kf-itwork.deploy-workbench-front.devgw.yonghui.cn` : `http://public-service.deploy-workbench-front.gw.yonghui.cn`)
        //       + `/deploy/workbench?projectId=${curApp?.projectId}&appParams=${curApp?.id}`
        //   )
        //   break;
      }
    }, [curApp]
  )

  // 删除自定义标签
  const onCloseLabel = useCallback((index: number, record: IPipelineList) => {
    const curLabelList = record.pipelineTags.split(',')
    curLabelList.splice(index, 1)
    createPipelineLabel(
      curApp.projectId,
      record.pipelineId,
      curLabelList.join(','),
      record.versionId,
    ).then(() => {
      message.success('标签删除成功！');
      loadAppPipelineList();
    })
  }, [curApp])

  // 列信息
  const columns = useMemo(() => {
    return [
      {
        title: '状态',
        dataIndex: 'status',
        width: 120,
        fixed: 'left',
        render: renderStatus,
      },
      {
        title: (
          <span>
            标识&ensp;
            <Tooltip title='持续集成流水线的标识，以及持续集成流水线创建者'>
              <QuestionCircleTwoTone />
            </Tooltip>
          </span>
        ),
        dataIndex: 'pipelineId',
        width: 100,
        align: 'center',
        fixed: 'left',
        render: (_: number, record: IPipelineList) => (
          <Space direction='vertical' size={2}>
            <span>#{_}</span>
            <span>
              by&ensp;
              <Tooltip
                title={(
                  <span style={{color: '#000000'}}>
                    {record.pipelineUserUrl && <Avatar src={record.pipelineUserUrl} size="small" />}
                    &ensp;{record.pipelineUserName}&ensp;
                  </span>
                )}
                color='#ffffff'
              >
                {record.pipelineUserName?.split('#')[0]}
              </Tooltip>
            </span>
            {
              record.latest && (<Tag color="green">lasted</Tag>)
            }
          </Space>
        )
      },
      {
        title: (
          <span>
            提交&ensp;
            <Tooltip title='最新一次提交的提交编码及提交信息，以及触发的分支'>
              <QuestionCircleTwoTone />
            </Tooltip>
          </span>
        ),
        dataIndex: 'commit',
        width: 200,
        fixed: 'left',
        render: renderCommit,
      },
      {
        title: '版本',
        dataIndex: 'version',
        width: 300,
        // fixed: 'left',
        render: (_: string) => {
          return _ ? (
            <div style={{display: 'flex'}}>
              <Paragraph 
                className={styless.ciVersionCopy}
                copyable={{ text: _ || '暂无' }}
              />
              &ensp;{_}
            </div>
          ) : null
        }
      },
      {
        title: (
          <span>
            阶段&ensp;
            <Tooltip 
              title='持续集成的阶段是在gitlab-ci文件里定义的。例如，可以分为单元测试和生成镜像两个阶段。单元测试阶段完成单元测试的运行并且对代码质量进行审查，生成镜像阶段通过 docker 把应用生成镜像。
              可点击阶段icon展开详情，支持跳转查看详情日志与重试功能。'
            >
              <QuestionCircleTwoTone />
            </Tooltip>
          </span>
        ),
        dataIndex: 'stages',
        width: 220,
        render: (_: IStageProp[], record: IPipelineList) => renderStage(_, record, curApp.projectId, loadAppPipelineList),
      },
      {
        title: '标签',
        dataIndex: 'pipelineTags',
        width: 200,
        render: (_: string, record: IPipelineList) => {
          return _ && _.split(',').map((item, ind) => (
            <Tag 
              key={item}
              color="warning" 
              closable 
              onClose={() => onCloseLabel(ind, record)}
            >
              {item}
            </Tag>
          ))
        }
      },
      {
        title: '附件',
        dataIndex: 'jar',
        width: 300,
        render: (_: string) =>  {
          let link = _
          const isImage = link?.endsWith('.jpg') || link?.endsWith('.png') || link?.endsWith('.jpeg')
          if ( link && link.lastIndexOf(".plist") >= 0 ) {
            link = link.replace(
              "http://cos.shanghai.tce.yonghuicloud.cn/prod-file-service-1255000089",
              "itms-services:///?action=download-manifest&url=https://app-download.yonghui.cn/test"
            );
          }
          const imageComponent = isImage ? (
            <Image src={link} preview={false} />
          ) : (
            <QRCode value={link} size={220} />
          ) 
          return link && (
            <Space>
              <Tooltip 
                title={imageComponent}
              >
                <div className={styless.ciJarFile}>
                  {imageComponent}
                </div>
              </Tooltip>
              <Paragraph 
                className={styless.ciVersionCopy}
                copyable={{ text: link || '暂无' }}
                ellipsis={{ tooltip: link, rows: 3 }}
              >
                {link}
              </Paragraph>
            </Space>
          )
        }
      },
      {
        title: '时长',
        dataIndex: 'pipelineTime',
        width: 150,
        render: (_: string) =>  {
          const splitTime = _.split('.');
          return (
            <span>
              {splitTime[0] != '00' && (splitTime[0] + '时 ')}
              {splitTime[1] + '分 '}
              {splitTime[2] + '秒 '}
            </span>
          )
        }
      },
      {
        title: '操作人',
        dataIndex: 'pipelineUserName',
        width: 150,
        render: (_: string, record: IPipelineList) => (
          <Tooltip
            title={(
              <span style={{color: '#000000'}}>
                {record.pipelineUserUrl && <Avatar src={record.pipelineUserUrl} size="small" />}
                &ensp;{_}&ensp;
              </span>
            )}
            color='#ffffff'
          >
            {_}
          </Tooltip>
        )
      },
      {
        title: '最后操作时间',
        dataIndex: 'lastUpdateDate',
        width: 200,
      },
      {
        title: '创建时间',
        dataIndex: 'creationDate',
        width: 150,
        render: (_: string) => (
          <Tooltip title={_}>
            <TimeAgo
              datetime={_}
              locale='zh_CN'
            />
          </Tooltip>
        )
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 250,
        fixed: 'right',
        render: (_, record) => (
          <Space size={16}>
            <a onClick={() => onTableAction('release', record)}>发布</a>
            <JumpDeployButton
              appInfo={curApp}
              envsMap={projectEnvs}
            />
            <a onClick={() => onTableAction('ciVariable', record)}>CI变量</a>
            <a onClick={() => onTableAction('createLabel', record)}>添加标签</a>
          </Space>
        )
      },
    ] as ITableProps<IPipelineList>[]
  }, [curApp, projectEnvs])

  return useMemo(() => {
    return (
      <Card
        className={styless.operationList}
        bodyStyle={{ padding: '1px 12px' }}
      >
        <SearchForm
          formInstance={form}
          hasAutoRefresh
          defaultAutoRefresh={defaultAutoRefresh}
          onSearch={loadAppPipelineList}
          onReFresh={() => setRefreh((p) => !p)}
          onReFreshChange={setDefaultAutoRefresh}
        >
          <BranchTagSelect
            name={'branch'}
            label='分支/标记'
            sortBranchTag={true}
            placeholder='请选择'
            projectId={curApp?.projectId}
            appId={curApp?.id}
          />
          <Form.Item name="tagName" label="标签">
            <Input placeholder="请输入" />
          </Form.Item>
        </SearchForm>
        <Divider style={{margin: '0 0 12px'}} />
        <Table<IPipelineList>
          rowKey={'pipelineId'}
          dataSource={operationList}
          loading={loading}
          columns={columns}
          scroll={{
            x: 'min-content'
          }}
          pagination={{
            showQuickJumper: true,
            showSizeChanger: true,
            current: pageInfo.page + 1,
            pageSize: pageInfo.size,
            total: total,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, size) => setPageInfo({
              page: page - 1, 
              size,
            }),
          }}
        />
        <CreateLabel 
          visible={modalType=='createLabel'}
          appInfo={curApp}
          pipelineInfo={pipelineInfo}
          onSuccess={loadAppPipelineList}
          onCancel={() => {
            setPipelineInfo(undefined);
            setModalType(undefined);
          }}
        />
        <PipelineCiVariable
          visible={modalType=='ciVariable'}
          appInfo={curApp}
          pipelineInfo={pipelineInfo}
          onSuccess={loadAppPipelineList}
          onCancel={() => {
            setPipelineInfo(undefined);
            setModalType(undefined);
          }}
        />
      </Card>
    )
  }, [curApp, loading, modalType, projectEnvs, operationList, pageInfo, total, refreh, defaultAutoRefresh])
}

const HomeList = forwardRef(HomeListRefComponent)

export { HomeList }