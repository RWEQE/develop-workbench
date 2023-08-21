import React, { useState, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Row, Col, Card, Typography, Spin, Button, message } from '@middle/ui';
const { Paragraph, Link } = Typography;
import { ExportOutlined, ReloadOutlined } from '@ant-design/icons';
import { ConsoleItem } from './ConsoleItem';
import { 
  checkAppPermission,
  queryAppDetail,
  queryAppCodeCommit, 
  queryAppMergeRequest, 
  queryAppTag,
  queryAppBranch,
} from '@/services/develp-workbench';
import { ModalTypeEnum, IApplicaitonList, IApplicationDetail } from '@/interfaces/develop-workbench';
import { PromiseAllSettledRes } from '@/interfaces/common';
import dayjs from 'dayjs';
import styless from './index.less';

interface ConsoleInfoProp {
  curApp: IApplicaitonList;
  onActionModalOpen: (modalType: ModalTypeEnum) => void;
}

export interface ConsoleInfoRef {
  reload?: () => void;
  reloadConsoleInfo?: (funcType: 'mergeRequest' | 'tag' | 'branch') => void;
}

const ConsoleInfoRefComponent: React.ForwardRefRenderFunction<
  ConsoleInfoRef,
  ConsoleInfoProp
> = (
  {
    curApp,
    onActionModalOpen,
  },
  ref
) => {

  const [curAppDetail, setCurAppDetail] = useState<IApplicationDetail>(); // 应用详情
  const [loading, setLoading] = useState<boolean>(false);
  const isDevelop = window.location.host.indexOf('kf-itwork') >= 0;

  useEffect(() => {
    if(curApp) {
      loadAppAllInfo();
    }
  }, [curApp])

  useImperativeHandle(
    ref,
    () => {
      return {
        reload: loadAppAllInfo,
        reloadConsoleInfo: loadConsoleInfo,
      };
    },
    [curApp],
  );

  // 选择应用后 调用所有应用信息接口
  const loadAppAllInfo = useCallback(() => {
    setLoading(true)
    Promise.allSettled([
      getAppPermission(),
      loadApplicationDetail(),
      loadApplicationCodeCommit(),
      loadApplicationMergeRequest(),
      loadApplicationTag(),
      loadApplicationBranch(),
    ]).then(
      (
        [permissionRes, detailRes, commitRes, mergeRes, tagRes, branchRes]: PromiseAllSettledRes[]) => {
        setCurAppDetail({
          ...detailRes?.value,
          hasPermission: permissionRes?.value || false,
          codeCommitCount: commitRes?.value?.totalCommitsDate?.length || 0,
          mergeRequestCount: mergeRes?.value?.totalCount || 0,
          tagCount: tagRes?.value?.length || 0,
          branchCount: branchRes?.value?.data?.count || 0,
        });
      }
    ).finally(
      () => setLoading(false)
    )
  }, [curApp, curAppDetail])

  // 刷新某项统计数据
  const loadConsoleInfo = (funcType: 'mergeRequest' | 'tag' | 'branch') => {
    if(funcType == 'mergeRequest') {
      loadApplicationMergeRequest(true);
    } else if (funcType == 'tag') {
      loadApplicationTag(true);
    } else if (funcType == 'branch') {
      loadApplicationBranch(true);
    }
  }

  // 确认是否有项目权限
  const getAppPermission = useCallback(() => {
    return checkAppPermission(curApp.projectId, curApp.id)
  }, [curApp])

  // 获取 应用 详情
  const loadApplicationDetail = useCallback(() => {
    return queryAppDetail(curApp.projectId, curApp.id)
  }, [curApp])

  // 获取 应用 代码提交记录
  const loadApplicationCodeCommit = useCallback(() => {
    return queryAppCodeCommit(
      curApp.projectId, 
      curApp.id,
      dayjs(new Date()).subtract(7, 'day').format('YYYY/MM/DD'),
      dayjs(new Date()).format('YYYY/MM/DD'),
    )
  }, [curApp])

  // 获取 应用 合并请求记录
  const loadApplicationMergeRequest = useCallback((needSet: boolean = false) => {
    return queryAppMergeRequest({
      projectId: curApp.projectId, 
      applicationId: curApp.id,
      page: 0,
      size: 999,
      state: 'opened',
    }).then((res) => {
      if(needSet) {
        setCurAppDetail((curAppDetail: any) => {
          return {
            ...curAppDetail!,
            mergeRequestCount: res?.totalCount || 0
          }
        })
      }
      return res
    })
  }, [curApp])

  // 获取 应用 标记记录
  const loadApplicationTag = useCallback((needSet: boolean = false) => {
    return queryAppTag(
      curApp.projectId, 
      curApp.id,
    ).then((res) => {
      if(needSet) {
        setCurAppDetail((curAppDetail: any) => {
          return {
            ...curAppDetail!,
            tagCount: res?.length  || 0
          }
        })
      }
      return res
    })
  }, [curApp])

  // 获取 应用 分支记录
  const loadApplicationBranch = useCallback((needSet: boolean = false) => {
    return queryAppBranch(curApp.id).then(
      (res) => {
        if(needSet) {
          setCurAppDetail((curAppDetail: any) => {
            return {
              ...curAppDetail!,
              branchCount: res?.data?.count || 0
            }
          })
        }
        return res
      }
    )
  }, [curApp])

  // 打开弹窗
  const onAllActionModalOpen = useCallback((modalType: ModalTypeEnum) => {
    if(!curApp) {
      message.warning('请先选择应用！');
      return;
    }
    if(modalType == 'buildApp' && !curAppDetail?.hasPermission) {
      message.warning('没有该应用权限，请联系该项目的架构师在应用管理内分配应用权限，或联系该应用的开发负责人进行权限分配！');
      return;
    }
    onActionModalOpen(modalType)
  }, [onActionModalOpen, curAppDetail])

  return useMemo(() => {
    return (
      <Spin spinning={loading}>
        <Row
          className={styless.consoleInfo}
          gutter={16}
        >
          <Col span={16}>
            <Card bodyStyle={{padding: 8}}>
              <ConsoleItem
                title='构建应用'
                description='生成服务可部署的版本'
                onClick={() => onAllActionModalOpen('buildApp')}
              />
              <ConsoleItem
                title='设置构建应用脚本'
                description='定义服务编译构建执行的命令'
                onClick={() => onAllActionModalOpen('appBuildScript')}
              />
              <ConsoleItem
                title='CI变量'
                description='持续集成变量'
                onClick={() => onAllActionModalOpen('ciVariable')}
              />
              <ConsoleItem
                title={`${curAppDetail?.mergeRequestCount || 0}`}
                description='合并请求数'
                msgPositionSwitch
                extraButton
                onClick={() => onAllActionModalOpen('mergeRequest')}
                onExtraClick={() => {
                  window.open(`${curAppDetail?.repoUrl.split(".git")[0]}/merge_requests/new`)
                }}
              />
              <ConsoleItem
                title={`${curAppDetail?.tagCount || 0}`}
                description='标记数'
                msgPositionSwitch
                extraButton
                onClick={() => onAllActionModalOpen('tagManagement')}
                onExtraClick={() => onAllActionModalOpen('createTag')}
              />
              <ConsoleItem
                title={`${curAppDetail?.branchCount || 0}`}
                description='分支数'
                msgPositionSwitch
                extraButton
                onClick={() => onAllActionModalOpen('branchManagment')}
                onExtraClick={() => onAllActionModalOpen('createBranch')}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card bodyStyle={{height: 180, padding: '0 24px'}}>
              <div className={styless.applicationMsg}>
                <div className={styless.repositoryAdress}>
                  <Paragraph copyable={{ text: curAppDetail?.repoUrl || '暂无' }}>
                    仓库地址
                  </Paragraph>
                  <Link
                    href={curAppDetail?.repoUrl || '暂无'}
                    target="_blank"
                    ellipsis={true}
                  >
                    {curAppDetail?.repoUrl || '暂无'}
                  </Link>
                </div>
                <div className={styless.repositoryAdress}>
                  <Paragraph>
                    近七天提交代码数&ensp;
                    <ExportOutlined 
                      style={{color: '#3167FC'}}
                      onClick={() => {
                        window.open(`${isDevelop ?
                          'http://kfitwork.yonghui.cn/' :
                          'http://itwork.yonghui.cn/'}/#/devops/reports/submission?type=project&code=${curApp.projectCode}&id=${curApp.projectId}&name=${curApp.projectName}&organizationId=${curApp.organizationId}&appId=${curApp.id}
                        `)
                      }}
                    />
                  </Paragraph>
                  <span className={styless.titleMsg}>
                    {curAppDetail?.codeCommitCount || 0}
                  </span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
    )
  }, [curApp, curAppDetail, loading, onActionModalOpen])
}

const ConsoleInfo = forwardRef(ConsoleInfoRefComponent)

export { ConsoleInfo }