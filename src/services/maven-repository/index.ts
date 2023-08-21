import { request } from '@/utils/request';

// 获取 maven仓库列表
export const queryMavenList = (params: {
  pageNo: number,
  pageSize: number,
  projectId: number;
  env?: number,
  groupId?: string;
  artifactId?: string;
  version?: string;
  userIds: number[];
}) => {
  return request.post(`/api/maven-manager/v1/projects/${params.projectId}/maven/list`, {
    data: params,
  })
}

// 获取 maven 环境的枚举
export const queryEnvEnum = () => {
  return request.get('/api/maven-manager/v1/enum/env')
}

// 创建人/审核人列表
export const queryUsers = (userName?: string) => {
  return request.get(`/api/iam/v1/all/users?sort=id&page=0&size=100`, {
    params: { param: userName },
  });
};

// 获取 上传文件类型的枚举
export const queryFileType = () => {
  return request.get('/api/maven-manager/v1/enum/file_type')
}

// 上传 maven仓库
export const uploadMaven = (params: {
  projectId: number;
  artifactId: string;
  env: number;
  fileType: number;
  groupId: string;
  uploadJar: any;
  version: string;
  jarFileUrl?: string;
  jarFileName?: string;
  pomFileUrl?: string;
  pomFileName?: string;
}) => {
  return request.post(`/api/maven-manager/v1/projects/${params.projectId}/maven`, {
    data: params,
  })
}

// 分页查询 包引用
export const queryFileReference = (params: {
  page: number,
  size: number,
  artifactId: string,
  version?: string;
}) => {
  return request.post(`/api/openapi/v1/code/openapi-maven-queryArtifactRef/type/page/login`, {
    data: params,
  })
}

// 查询 实例对应的环境
export const queryInstanceEnvs = (params: {
  appId: number,
  versionId: number;
}) => {
  return request.post(`/api/openapi/v1/code/openapi-maven-queryInstanceByAppVersion/type/list/login`, {
    data: params,
  })
}

// 分页查询 maven上传记录的变更描述列表
export const queryChangeDesc = (project_id: number, params: {
  pageNo: number,
  pageSize: number,
  infoId: number,
}) => {
  return request.post(`/api/maven-manager/v1/projects/${project_id}/maven/description/list`, {
    data: params,
  })
}

// 修改 描述
export const editChangeDesc = (project_id: number, params: {
  infoId: number,
  newDescription: string,
}) => {
  return request.put(`/api/maven-manager/v1/projects/${project_id}/maven/description/update`, {
    data: params,
  })
}
