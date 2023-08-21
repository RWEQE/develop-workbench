import { useCallback, useMemo } from 'react';
import { Tag, Space, Tooltip, Popover, Typography, Avatar } from '@middle/ui';
const { Text } = Typography;
import { 
  CheckCircleOutlined,
  CloseCircleOutlined,
  StopOutlined,
  PauseCircleOutlined,
  BranchesOutlined,
  CheckCircleFilled, 
  CloseCircleFilled, 
  createFromIconfontCN,
  InfoCircleOutlined,
  PlayCircleFilled,
} from '@ant-design/icons';
import { retryCiJob, playCiJob, cancelCiJob } from '@/services/develp-workbench';
import {
  IPipelineList,
  PipelineStatusEnum,
  IStageProp,
  PipelineStageEnum,
}  from  '@/interfaces/develop-workbench/index';
import styless from './index.less';
import { message } from 'antd';

// iconFont 官网上选择的 icon
const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_3408001_fcd1almsc64.js',
});

// 渲染 状态
export const renderStatus = (_: keyof typeof PipelineStatusEnum, record: IPipelineList, index: number) => {
  return (
    <Tag
      className={styless.pipelineStatusTag}
      color={PipelineStatusEnum[_]?.color || 'default'}
      icon={
        {
          passed: <CheckCircleOutlined />,
          running: <IconFont type='icon-processing' />,
          skipped: <IconFont type='icon-skipped' />,
          failed: <CloseCircleOutlined />,
          canceled: <IconFont type='icon-canceled' />,
          pending: <PauseCircleOutlined />,
        }[_] || <StopOutlined />
      }
    >
      {PipelineStatusEnum[_]?.text || _}
    </Tag>
  )
}

// 渲染 提交
export const renderCommit = (_: string, record: IPipelineList) => {
  return (
    <Space 
      style={{width: '100%'}}
      direction='vertical' 
      size={2}
    >
      <div className={styless.pipelineCommit}>
        <Text ellipsis={{tooltip: record.ref}} >
          <BranchesOutlined />&thinsp;
          <a
            className={styless.pipelineCommitRef}
            href={`${record.gitlabUrl?.split('.git')[0]}/commits/${record.ref}`} target='_blank'
          > 
            {record.ref}
          </a>
        </Text>
        &ensp;
        <Tooltip title={_} >
          <IconFont
            className={styless.iconCommit}
            type='icon-commit'
          />
          <a href={`${record.gitlabUrl?.split('.git')[0]}/commit/${record.commit}`} target='_blank'> 
            {_.slice(0, 5)}
          </a>
        </Tooltip>
      </div>
      <span>
        by&ensp;
        <Tooltip
          title={(
            <span style={{color: '#000000'}}>
              {record.commitUserUrl && <Avatar src={record.commitUserUrl} size="small" />}
              &ensp;{record.commitUserName}&ensp;
            </span>
          )}
          color='#ffffff'
        >
          {record.commitUserName?.split('#')[0]}
        </Tooltip>
      </span>
      <Tooltip title={record?.commitContent} overlayStyle={{maxWidth: 350}}>
        <Text ellipsis={true}>
          <a 
            style={{color: '#222'}}
            href={`${record?.gitlabUrl?.split('.git')[0]}/commit/${record?.commit}`} target='_blank'
          >
            {record?.commitContent}
          </a>
        </Text>
      </Tooltip>
    </Space>
  )
}

// 渲染 阶段
export const renderStage = (
  stages: IStageProp[],
  record: IPipelineList, 
  projectId: number, 
  onSucccess: () => void,
) => {
  return (
    <div className={styless.ciPhase}>
    {
      stages.map((stage: IStageProp, index: number) => {
        return (
          <>
            <Popover
              key={stage.id}
              placement="bottom"
              content={(
                <StateOpContent 
                  record={record} 
                  stage={stage} 
                  projectId={projectId}
                  onSucccess={onSucccess}
                />
              )}
              trigger="click"
            >
              <Tooltip
                title={`${stage.name}: ${
                  stage.status === "warning"
                    ? `${record.status} with ${stage.status}`
                    : stage.status
                }`}
              >
                <span>
                  <StageIcon status={stage.status} />
                </span>
              </Tooltip>
            </Popover>
            {
              stages[index + 1] ? <div className={styless.stageAfter}></div> : ''
            }
          </>
        )
      })
    }
    </div>
  )
}

// 阶段的图标
const StageIcon: React.FC<{
  status: keyof typeof PipelineStageEnum
}> = ({
  status,
}) => {
  return useMemo(() => {
    switch(status) {
      case 'created':
      case 'manual':
        return <IconFont type='icon-init' />
      case 'skipped': 
        return <IconFont type='icon-skipped' />
      case 'pending':
        return <PauseCircleOutlined style={{color: '#FAD337'}} />
      case 'success':
        return <CheckCircleFilled style={{color: '#52c41a'}} />
      case 'running':
        return <IconFont type='icon-processing' />
      case 'failed':
        return <CloseCircleFilled style={{color: '#ff4d4f'}} />
      case 'warning':
        return <InfoCircleOutlined style={{color: '#faad14'}} />
      case 'canceled':
        return <IconFont type='icon-canceled-gray' />
      default:
        return <IconFont type='icon-init' />
    }
  }, [status])
}

// 获取 不同阶段的弹出框
const StateOpContent:React.FC<{
  record: IPipelineList, 
  stage: IStageProp,
  projectId: number,
  onSucccess: () => void,
}> = ({
  record,
  stage,
  projectId,
  onSucccess,
}) => {
  const { gitlabUrl } = record;
  const url = gitlabUrl && gitlabUrl.split(".git")[0];

  // 启动阶段任务
  const onRunJob = useCallback((stage, record) => {
    const { id, status } = stage;
    const { gitlabProjectId } = record;
    const runJobFunc = status == 'manual' ? playCiJob : ['running', 'created'].includes(status) ? cancelCiJob : retryCiJob;
    runJobFunc(projectId, gitlabProjectId, id).then(
      (res) => {
        message.success(
          status == 'manual' ? '启动成功！' :
          ['running', 'created'].includes(status) ? '取消成功！' : '重跑成功！'
        )
        onSucccess();
      }
    )
    }, [projectId, onSucccess])

  return useMemo(() => {
    return (
      <div className={styless.stagePo}>
        <Tooltip title={`${stage.name}: ${stage.status}(可点击查看详情日志)`}>
          <div
            className={styless.stagePoDesc}
            onClick={() => {
              window.open(`${url}/-/jobs/${stage.id}`);
            }}
          >
            <StageIcon status={stage.status}/>
            &ensp;
            <a>{stage.name}</a>
          </div>
        </Tooltip>
        {stage.status !== "skipped" ? (
          <Tooltip
            title={
              stage.status === "manual"
                ? "启动"
                : stage.status === "running" || stage.status === "created"
                ? "取消"
                : "重试"
            }
          >
            <span 
              className={styless.ciPoAction} 
              onClick={() => onRunJob(stage, record)}
            >
              {
                stage.status === "manual"
                  ? <PlayCircleFilled style={{color: '#666'}} />
                  : stage.status === "running" || stage.status === "created"
                  ? <IconFont type='icon-canceled-gray' />
                  : <IconFont type='icon-replay' />
              }
            </span>
          </Tooltip>
        ) : null}
      </div>
    );
  }, [record, stage, projectId, onSucccess])
};