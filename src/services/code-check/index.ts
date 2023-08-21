import { request } from '@/utils/request';

// 分页查询代码审核列表
interface QueryReviewsParams {
  page: {
    size: number;
    startPage: number;
  };
  params?: {
    crCode?: string;
    issueStr?: string;
    projectStr?: string;
    creatorName?: string;
    moderatorName?: string;
    crStatus?: string[];
    createStartTime?: number;
    createEndTime?: number;
  };
}
export const queryReviews = (params: QueryReviewsParams) => {
  return request.post(`/api/yh-fisheye-service/v1/projects/1/fisheye/reviews`, {
    data: params,
  });
};

// 创建人/审核人列表
export const queryUsers = (userName?: string) => {
  return request.get(`/api/iam/v1/all/users?sort=id&page=0&size=100`, {
    params: { param: userName },
  });
};

// 详情
export const queryDetail = (projectId: string, crCode: string) => {
  return request.get(`/api/yh-fisheye-service/v1/projects/${projectId}/fisheye/reviews/${crCode}`);
};

// 修改审核人
export const updateModerate = (projectId: string, crCode: string, moderateName: string) => {
  return request.put(
    `/api/yh-fisheye-service/v1/projects/${projectId}/fisheye/reviews/${crCode}/moderate/${moderateName}`,
    { responseType: 'text' },
  );
};

// itwork需求列表（废弃）
export const queryIssues = (content: string) => {
  return request.post(`/api/agile/v1/projects/1/issues/all?source=1&page=0&size=100`, {
    params: { content },
  });
};

// 星云 - 查询空间
export const queryPojects = (userId: number) => {
  return request.get(`/api/iam/v1/users/${userId}/projects`);
};

// 星云 - 查询迭代
export const queryIterations = (projectId: number) => {
  return request.post(
    `/api/openapi/v1/code/openapi-testWorkbench-TestPlan-batchQueryIteration/type/list`,
    {
      data: { teamSpaceId: projectId },
    },
  );
};

// 星云 - 查询任务
export const queryTask = (iterationId: number) => {
  return request.post(`/api/openapi/v1/code/openapi-queryTaskList/type/list`, {
    data: { iterationId },
  });
};

// 应用服务列表
export const queryApps = (projectId: string, issueId: string, keywords: string) => {
  return request.get(
    `/api/devops-action/v1/project/${projectId}/issue/${issueId}/app?sort=id&page=0&size=100&source=2`,
    { params: { param: keywords } },
  );
};

// 分支列表
export const queryBranch = (projectId: string, issueId: string, appId: string) => {
  return request.get(
    `/api/devops-action/v1/project/${projectId}/issue/${issueId}/app/${appId}/branch?source=2`,
  );
};

// 创建审核
export const createCheck = (projectId: string, params: any) => {
  return request.post(`/api/yh-fisheye-service/v1/projects/${projectId}/fisheye/reviews/add`, {
    responseType: 'text',
    data: {
      source: 2, // 星云需求
      ...params,
    },
  });
};
