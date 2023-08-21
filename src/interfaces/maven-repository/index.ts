// 单个maven信息
export interface MavneItem {
  artifactId: string;
  createByName: string;
  createdBy: string;
  creationDate: string;
  env: number;
  envCode: "dev"
  fileType: number[];
  fileTypeStr: "jar"
  fileUrl: string;
  groupId: string;
  id: number;
  jarFileUrl: string;
  pomFileUrl: string;
  resourceFileUrl: string;
  uploadJar: boolean;
  uploadPom: boolean;
  uploadResource: boolean;
  repositoryType: 1
  repositoryTypeStr: string;
  uploadStatus: 2
  uploadStatusDesc: string;
  version: string;
  description: string;
}

// 环境信息
export interface EnumItem {
  code: number;
  desc: string;
  scode: string;
}

// 环境信息的描述文案
export const codeMap = {
  1: "(dev)",
  2: "(sit,t1)",
  3: "",
  4: "(prod,pre)",
  5: "",
};

export type MavenActionType = 'editDescription'

export interface IReference {
  artifactId: string;
  version: string;
  buildBranch: string;
  buildJobUrl: string;
  buildDate: string;
  creator: string;
  applicationName: string;
  applicationCode: string;
  applicationId: number;
  appVersionId: number;
  projectName: string;
  appVersion: string;
  organizationName: string;
  instanceCount: number;
  pipeline_id: number;
}

export interface IOperationLog {
  content: string;
  createByName: string;
  createdBy: string;
  creationDate: string;
  id: number;
  infoId: number;
}