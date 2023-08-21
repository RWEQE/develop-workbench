import { request } from '@/utils/request';
import { getProjectId } from '@/utils/storage';

/** 获取当前的用户 GET */
export const queryCurrentUser = () => request('/api/iam/v1/users/self');

interface QueryAppListParams {
  userId: number;
  page: number;
  size: number;
  projectIds?: Array<number>; // 项目id 数组 多选
  appIds?: Array<number>; // 应用id 数组 多选
  searchText?: string; // 应用名称/编码 模糊查询
}

// 查询项目下应用列表 分页 page
export const queryAppList = (params: QueryAppListParams) => {
  return request.post(
    `/api/openapi/v1/code/openapi-application-queryAppsByUserId/type/page/login`,
    {
      data: {
        openXmlMappedStatementId: "queryAppsByUserId",
        openXmlMappedStatementTotalId: "total",
        ...params,
      },
    },
  );
};

// 查询项目下应用列表 list
export const queryAllAppList = (params: Omit<QueryAppListParams, 'page'|'size'>) => {
  return request.post(
    `/api/openapi/v1/code/openapi-application-queryAppsByUserId/type/list/login`,
    {
      data: {
        openXmlMappedStatementId: "queryAppsByUserId",
        openXmlMappedStatementTotalId: "total",
        ...params,
      },
    },
  );
};

// 查询项目下应用列表 list
export const quertProjects = (uid: number) => {
  return request.get(`/api/iam/v1/users/${uid}/projects`);
};

// 获取环境地址
export const getEnvUrls = (apiId: string) => {
  return request.get(`/api/gateway-management/v1/manager/${getProjectId()}/url/${apiId}`);
};

// 获取 新增、编辑、同步 权限
export const getPrivilige = () => {
  return request.post(`/api/gateway-management/v1/credential/${getProjectId()}/queryPrivilege`, {
    data: { apiEnv: '' },
  });
};

// 获取 新增-保存并发布 按钮权限
export const getSaveAndPublishPrivilige = (apiEnv: string) => {
  return request.post(`/api/gateway-management/v1/credential/${getProjectId()}/queryPrivilege`, {
    data: { apiEnv },
  });
};
