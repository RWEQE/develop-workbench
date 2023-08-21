import { request } from '@/utils/request';
import { post, put } from '@/utils/axios';
import { AppBuildScriptDetail, IDeployModule } from '@/interfaces/develop-workbench';

// 查询项目下应用的应用详情
export const checkAppPermission = (projectId: number, applicationId: number) => {
  return request.get(
    `/api/devops-action/v1/projects/${projectId}/apps/${applicationId}/permission`,
  );
}

// 查询项目下应用的应用详情
export const queryAppDetail = (projectId: number, applicationId: number) => {
  return request.get(
    `/api/devops-action/v1/projects/${projectId}/apps/${applicationId}/detail`,
  );
}

// 查询项目下应用的代码提交
export const queryAppCodeCommit = (
  projectId: number, 
  applicationId: number, 
  start_date: string,
  end_date: string,
) => {
  return request.post(
    `/api/devops-action/v1/projects/${projectId}/commits`, {
      params: {
        start_date,
        end_date,
        page: 0,
        size: 999,
      },
      data: [applicationId],
    }
  );
}

// 查询项目下应用的合并请求数
export const queryAppMergeRequest = (
  params : {
    projectId: number;
    applicationId: number;
    page: number;
    size: number;
    state: string;
  }
) => {
  return request.get(
    `/api/devops-action/v1/projects/${params.projectId}/apps/${params.applicationId}/git/merge_request/list`, {
      params: {
        page: params.page,
        size: params.size,
        state: params.state,
      },
    }
  );
}

// 查询项目下应用的git工程地址
export const queryAppGitUrl = (
  projectId: number, 
  applicationId: number, 
) => {
  return request.get(
    `/api/devops-action/v1/projects/${projectId}/apps/${applicationId}/git/url`, {
      responseType: 'text',
    }
  );
}

// 查询项目下应用的标记数
export const queryAppTag = (
  projectId: number, 
  applicationId: number, 
) => {
  return request.get(
    `/api/devops-action/v1/projects/${projectId}/apps/${applicationId}/git/tag_list`, 
  );
}

// 查询项目下应用的分支数
export const queryAppBranch = (
  applicationId: number, 
) => {
  return request.post(
    `/api/openapi/v1/code/openapi-branch-getAppBranchCount/type/info/login`, {
      data: {
        appId: applicationId,
      }
    }
  );
}

// 流水线列表查询参数
interface QueryOperationListParams {
  appId: number;
  page: number;
  size: number;
  branch?: string; // 分支信息
  branchType?: 'branch' | 'tag'; // 分支类型
  tagName?: string; // 标签信息
}

// 分页查询 应用的 pipeline 列表(流水线列表)
export const queryAppPipelineList = (
  projectId: number, 
  params: QueryOperationListParams,
) => {
  return request.get(
    `/api/devops-action/v1/projects/${projectId}/pipeline/page`, {
      params: params
    }
  );
}

// 重试 流水线 任务
export const retryCiJob = (
  projectId: number, 
  gitlabProjectId: number,
  id: number,
) => {
  return request.post(
    `/api/devops-action/v1/projects/${projectId}/gitlab_projects/${gitlabProjectId}/jobs/${id}/retry`
  );
}

// 启动 流水线 任务
export const playCiJob = (
  projectId: number, 
  gitlabProjectId: number,
  id: number,
) => {
  return request.post(
    `/api/devops-action/v1/projects/${projectId}/gitlab_projects/${gitlabProjectId}/jobs/${id}/play`
  );
}

// 取消 流水线 任务
export const cancelCiJob = (
  projectId: number, 
  gitlabProjectId: number,
  id: number,
) => {
  return request.post(
    `/api/devops-action/v1/projects/${projectId}/gitlab_projects/${gitlabProjectId}/jobs/${id}/cancel`
  );
}

// 添加流水线标签
export const createPipelineLabel = (
  projectId: number, 
  pipelineId: number,
  pipelineTags: string,
  versionId: number,
) => {
  return request.put(
    `/api/devops-action/v1/projects/${projectId}/pipeline/update_tags`, {
      data: {
        pipelineId,
        pipelineTags,
        versionId,
      }
    }
  );
}

// 构建应用 初始 校验
export const checkAppExecute = (
  projectId: number, 
  appId: number, 
) => {
  return request.post(
    `/api/devops-action/v1/projects/${projectId}/cicd_pipelines/execute/check`, {
      data: {
        appId,
        type: 'default',
        status: 1,
      }
    }
  );
}

// 查询 项目内用户角色
export const queryUserRoleByProject = (
  projectId: number, 
  userId: number, 
) => {
  return request.get(
    `/api/iam/v1/projects/${projectId}/role_members/users/${userId}`
  );
}

// 验证应用是否已在平台配置CI脚本
export const checkAppHasCicd = (
  projectId: number, 
  appId: number, 
) => {
  return request.get(
    `/api/devops-action/v1/projects/${projectId}/cicd_pipelines/content/check?appId=${appId}`
  );
}

// 获取 应用下分支 对应的 deploy模块
export const queryAppBranchModules = (
  appId: number, 
  branchName: string,
  branchType: string,
) => {
  return request.post(
    `/api/openapi/v1/code/openapi-queryModulesByAppAndRef/type/list`, {
      data: {
        appId,
        branchName,
        branchType,
      }
    }
  );
}

// 刷新 应用下分支 对应的 deploy模块
export const refreshAppBranchModules = (
  projectId: number, 
  appId: number, 
  branchName: string,
  branchType: string,
) => {
  return request.get(
    `/api/devops-action/v1/projects/${projectId}/cicd_pipelines/modules/refresh`, {
      params: {
        appId,
        branchName,
        branchType,
      }
    }
  );
}

// 保存 应用下分支 对应的 deploy模块
export const saveAppBranchModules = (
  projectId: number, 
  appId: number, 
  branchName: string,
  branchType: string,
  params: IDeployModule[],
) => {
  return request.post(
    `/api/devops-action/v1/projects/${projectId}/cicd_pipelines/modules/save`, {
      params: {
        appId,
        branchName,
        branchType,
      },
      data: params,
    }
  );
}

// 获取 项目下查询有正在运行实例的环境
export const queryInstanceEnvs = (
  projectId: number, 
  appId: number, 
) => {
  return request.get(
    `/api/devops-action/v1/projects/${projectId}/envs/instance?appId=${appId}`,
  );
}

// 执行 Gitlab流水线
export const executeGitlabCi = (
  projectId: number, 
  params: any,
) => {
  return request.post(
    `/api/devops-action/v1/projects/${projectId}/cicd_pipelines/execute`, {
      data: [params],
    }
  );
}

// 获取 应用下原有的构建脚本命令
export const queryCiContent = (
  projectId: number, 
  appId: number, 
) => {
  return post(
    `/api/devops-action/v1/projects/${projectId}/cicd_pipelines/content`, {
      appId,
      status: 1,
      type: "default",
    }
  );
}

// 获取 应用构建脚本命令的变更历史
export const queryCiContentLog = (
  projectId: number, 
  appId: number, 
  page: number,
  size: number,
) => {
  return request.post(
    `/api/devops-action/v1/projects/${projectId}/cicd_pipelines/content/log`, {
      params: {
        appId,
        page,
        size,
      }
    }
  );
}

// 创建 应用的构建脚本
export const createCiContent = (
  projectId: number, 
  params: AppBuildScriptDetail
) => {
  return request.post(
    `/api/devops-action/v1/projects/${projectId}/cicd_pipelines/create`, {
      data: { ...params }
    }
  );
}

// 保存 应用的构建脚本
export const updateCiContent = (
  projectId: number, 
  params: AppBuildScriptDetail
) => {
  return request.post(
    `/api/devops-action/v1/projects/${projectId}/cicd_pipelines/update`, {
      data: { ...params }
    }
  );
}

// 获取持续集成应用变量信息
export const queryGlobalVariable = (
  projectId: number, 
  appId: number, 
) => {
  return request.get(
    `/api/devops-action/v1/projects/${projectId}/pipeline/global/variable?appId=${appId}`,
  );
}

// 获取某次流水线的持续集成变量
export const queryPipelineVariable = (
  pipelineId: number,
) => {
  return request.post(
    `/api/openapi/v1/code/openapi-pipeline-queryBuildLog/type/info`, {
      data: {
        pipelineId,
      }
    }
  );
}

// 创建 应用的 持续集成变量
export const createGlobalVariable = (
  projectId: number, 
  params: {
    id?: number;
    appId: number;
    dynamicVariables: string;
    immutableVariables: string;
  }
) => {
  return request.post(
    `/api/devops-action/v1/projects/${projectId}/pipeline/global/variable`, {
      data: {
        ...params,
      }
    }
  );
}

// 更新 应用的 持续集成变量
export const updateGlobalVariable = (
  projectId: number, 
  params: {
    id?: number;
    appId: number;
    dynamicVariables: string;
    immutableVariables: string;
  }
) => {
  return request.put(
    `/api/devops-action/v1/projects/${projectId}/pipeline/global/variable`, {
      data: {
        ...params,
      }
    }
  );
}

// 分页 获取分支列表
export const queryAppBranchList = (
  params: {
    projectId: number; 
    appId: number;
    page: number;
    size: number;
    filterParams: string;
  },
  extraParams?: object
) => {
  return request.post(
    `/api/devops-action/v1/projects/${params.projectId}/apps/${params.appId}/git/branches`, {
      params: {
        page: params.page,
        size: params.size,
        sort: 'creationDate,asc',
        ...extraParams,
      },
      data: {
        searchParam: {
          branchName: [params.filterParams],
        },
      }
    }
  );
}

// 创建分支
export const createBranch = (
  params: {
    projectId: number; 
    appId: number; // 4636
    branchName: string; // "feature-01-63497-test-create-branch"
    originBranch: string;
    taskId: number; // 63497
  }
) => {
  const { projectId, appId, branchName, originBranch, taskId } = params;
  return request.post(
    `/api/devops-action/v1/projects/${projectId}/apps/${0}/git/branchs/XingYun`, {
      data: [{
        appId,
        branchName,
        originBranch,
        taskId,
      }]
    }
  );
}

// 查询分支关联的任务清单
export const queryBranchTaskList = (
  branchId: number,
) => {
  return request.post(
    `/api/openapi/v1/code/openapi-DMS-queryBranchRelTaskInfo/type/list/login`, {
      data: {
        branchId,
      },
    }
  );
}

// 修改分支关联的问题
export const updateBranchTask = (
  params: {
    projectId: number; 
    appId: number; // 4636
    branchName: string; // "feature-01-63497-test-create-branch"
    taskId: number; // 63497
  }
) => {
  const { projectId, appId, branchName, taskId } = params;
  return request.put(
    `/api/devops-action/v1/projects/${projectId}/apps/${appId}/git/XingYun/branchUpdate`, {
      responseType: 'text',
      data: {
        taskId,
        branchName,
      },
    }
  );
}

// 修改分支关联的任务
export const exchangeBranchTask = (
  params: {
    branchId: number;
    oldTaskId: number; 
    newTaskId: number;
  }
) => {
  return request.post(
    `/api/openapi/v1/code/openapi-DMS-exchangeBranchToTask/type/update/login`, {
      data: {
        ...params,
      },
    }
  );
}

// 删除分支关联的问题
export const deleteBranchTask = (
  projectId: number,
  taskId: number, // 63497
  branchId: number, 
) => {
  return request.get(
    `/api/devops-action/v1/project/${projectId}/task/${taskId}/XingYun/delete/${branchId}`,
  );
}

// 分页 获取标记列表
export const queryAppTagList = (
  params: {
    projectId: number; 
    appId: number;
    page: number;
    size: number;
    filterParams: string;
  }
) => {
  return post(
    `/api/devops-action/v1/projects/${params.projectId}/apps/${params.appId}/git/tags_list_options?page=${params.page}&size=${params.size}`,
    {
      param: params.filterParams,
      searchParam: {}
    }
  );
}

// 创建标记
export const createAppTag = (
  params: {
    projectId: number; 
    appId: number;
    tag: string; // 标记名称
    ref: string; // 参考名称
    releaseNotes: string; // 发布日志
  }
) => {
  return post(
    `/api/devops-action/v1/projects/${params.projectId}/apps/${params.appId}/git/tags?tag=${params.tag}&ref=${params.ref}`,
      params.releaseNotes,
  );
}

// 更新标记
export const updateAppTag = (
  params: {
    projectId: number; 
    appId: number;
    tag: string; // 标记名称
    releaseNotes: string; // 发布日志
  }
) => {
  return put(
    `/api/devops-action/v1/projects/${params.projectId}/apps/${params.appId}/git/tags?tag=${params.tag}`, 
    params.releaseNotes
  );
}

// 校验 标签 是否可用 
export const checkTag = (
  params: {
    projectId: number; 
    appId: number;
    tag: string; // 标记名称
  }
) => {
  return request.get(
    `/api/devops-action/v1/projects/${params.projectId}/apps/${params.appId}/git/tags_check?tag_name=${params.tag}`, 
  );
}

// 查询项目下环境
export const queryProjectEnvs = (
  projectId: number
) => {
  return request.get(
    `/api/devops-action/v1/projects/${projectId}/envs?active=true`, 
  );
}

// 获取隐藏 deploy模块的时间
export const getDeployAllowTime = () => {
  return request.post(
    `/api/openapi/v1/code/openapi-maven-getSnapshotStaticTime/type/info/login`, {
      data: {}
    }
  ).then(({data}) => data);
}