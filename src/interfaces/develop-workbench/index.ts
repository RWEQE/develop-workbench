// 弹窗的类型
export const ModalTypeMap = [
  'buildApp', 
  'appBuildScript', 
  'branchManagment', 
  'tagManagement', 
  'ciVariable', 
  'mergeRequest',
  'createBranch',
  'createTag',
]

export type ModalTypeEnum = typeof ModalTypeMap[number]

// 弹窗控制变量 类型控制
export interface ModalControlProp {
  modalType?: ModalTypeEnum;
  appInfo?: IApplicaitonList | undefined;
  visible: boolean;
}

// 应用选择 应用列表
export interface IApplicaitonList {
  id: number;
  name: string;
  code: string;
  organizationId: number;
  projectId: number;
  projectName: string;
  projectCode: string;
}

export interface IApplicationDetail {
  id: number;
  name: string;
  code: string;
  projectId: number;
  projectName: string;
  projectCode: string;
  permission: boolean; // 是否与 权限
  repoUrl: string; // git仓库地址
  codeCommitCount: number; // 代码提交数
  mergeRequestCount: number; // 合并请求数
  tagCount: number; // 标记数
  branchCount: number; // 分支数
  hasPermission: boolean; // 权限与否
  // appTagId: null;
  // appTagName: null;
  // applicationTemplateId: null;
  // buckets: null;
  // contributor: null;
  // description: null;
  // fail: false;
  // failedMsg: null;
  // gitlabProjectE: {id: null, name: null, path: null, repoURL: 'http://gitlab.kfitwork.yonghui.cn/operation-test/gray-link-test-c.git'};
  // gitlabProjectId: number;
  // iwInfo: null;
  // midInfo: null;
  // publishLevel: null;
  // sonarUrl: "http://10.251.66.12:9090/dashboard?id=operation-test:gray-link-test-c";
  // synchro: boolean;
}

// 列表页 流水线列表
export interface IPipelineList {
  status: keyof typeof PipelineStatusEnum; // 流水线构建状态
  pipelineId: number;	// 流水线ID
  pipelineUser: number;		// pipeline流水线创建人 id
  pipelineUserName: string;	// pipeline流水线创建人用户名
  pipelineUserUrl: string;	// pipeline流水线创建人头像url
  latest: boolean;	// 标记latest
  ref: string;		// 分支
  commit: string;	// commit的SHA
  commitUser: number;	// 提交人 id
  commitUserUrl: string;	// 提交人的头像url
  commitUserName: string;		// 提交人用户名
  commitContent: string;	// 提交内容
  versionId: number;		// 版本ID
  version: string;		// 版本
  stages: IStageProp[],	// 阶段信息
  pipelineTags: string;	// 版本标签
  jar: string;	// 生成的文件
  pipelineTime: string;	// 流水线执行时间
  creationDate: string;	// pipeline流水线创建时间
  lastUpdateDate: string; // 最后修改时间
  gitlabProjectId: number;	// gitlab项目ID
  gitlabUrl: string,	// gitlab 仓库地址
}

// 阶段信息
export interface IStageProp {
  id: number;	// 阶段ID
  name: string;	// 阶段名称
  description: string;	// 阶段描述
  startedAt: string;	// 开始时间
  finishedAt: string;	// 结束时间
  status: keyof typeof PipelineStageEnum;	// 执行状态
}

export const PipelineStatusEnum = {
  passed: {
    code: 'passed',
    text: '已完成',
    color: 'success',
  },
  running: {
    code: 'running',
    text: '运行中',
    color: 'processing',
  },
  skipped: {
    code: 'skipped',
    text: '已跳过',
    color: 'default',
  },
  failed: {
    code: 'failed',
    text: '已失败',
    color: 'error',
  },
  canceled: {
    code: 'canceled',
    text: '已取消',
    color: 'default',
    icon: 'cancel',
  },
  pending: {
    code: 'pending',
    text: '等待',
    color: 'warning',
    icon: 'pause',
  }
} as const

export const PipelineStageEnum = {
  failed: { code: 'failed'},
  skipped: { code: 'skipped' },
  canceled: { code: 'canceled' },
  success: { code: 'success' },
  manual: { code: 'manual' },
  running: { code: 'running' },
  pending: { code: 'pending' },
  created: { code: 'created' },
  warning: { code: 'warning' },
};

// 校验构建
export interface AppExecuteCheckProp {
  isMavenProject: boolean;
  showDeployModules: boolean;
  mavenEnvs: Array<string>;
}

// 自动部署 环境信息
export interface AutoDeployEnvProp {
  id: number;
  name: string;
  code: string;
  envType: 'dev' | 'sit' | 'uat' | 'prod';
}

export const MavenEnvsEnum = {
  dev: {
    describe: '开发环境(dev)',
    prodBranchDisabled: true, // 生产分支禁用
  },
  sit: {
    describe: '测试环境(sit,t1)',
    prodBranchDisabled: true, // 生产分支禁用 
  },
  uat: {
    describe: '预发环境(uat)',
    prodBranchDisabled: true, // 生产分支禁用 
  },
  prod: {
    describe: '生产环境(prod)',
    prodBranchDisabled: false, // 生产分支禁用 
  },
}

export interface IDeployModule {
  deploy: boolean;
  module: string;
  path: string;
}

export interface AppBuildScriptDetail {
  // appId: 798
  content: string; // 配置内容
  // createdBy: 1
  // creationDate: string;
  id: number;
  // lastUpdateDate: "2021-07-12 17:47:26"
  // lastUpdatedBy: 1
  name: string; // 配置名称
  // objectVersionNumber: 1
  scriptType: 'maven' | "node" // 脚本类型
  status: 1
  type: "default"
}

export interface IScriptLog {
  id: number;
  scriptType: "maven" | "node"; // 脚本类型
  lastUpdateDate: string; // 操作时间
  realName: string; // 操作人
  content: string; // 配置内容
  // appCode: "test-0702-6"
  // appId: 798
  // appName: "test-0702-6"
  // createdBy: 1
  // creationDate: "2022-04-29 02:45:05"
  // lastUpdatedBy: 1
  // loginName: "admin"
  // name: "23444"
  // objectVersionNumber: 1
  // projectCode: "itwork-test"
  // projectId: 13
  // projectName: "itowrk-测试-产品系统"
  // status: 1
  // type: "default"
}

export interface IImmutableVariable {
  key: string;
  value: string;
}

export interface IDynamicVariable {
  key: string;
  defaultValue: string;
  values: Array<string>;
}

export interface IDemandPathInfo  {
  projectId: number;
  projectName: string;
  iterationId: number;
  iterationName: string;
  demandId: number;
  demandName: string;
  taskId: number;
  taskName: string;
}

// 分支列表项
export interface IBranchList {
  id: number; // 分支id
  branchName: string;
  commitContent: string;
  sha: string;
  branchType: 'branch' | 'tag'; 
  commitDate: string;
  commitUrl: string;
  commitUserName: string;
  commitUserUrl: string;
  createUserName: string;
  createUserRealName: string;
  createUserUrl: string;
  creationDate: string;
  // issueCode: null
  // issueId: null
  demandAllPath: string[]; // 关联需求名称
  demandAllPathInfoList: Array<IDemandPathInfo>;
  issueName: string;
  // typeCode: null
}

export const BranchTypeEnum = {
  master: {
    code: 'master',
    avatar: 'M',
    color: '#4d90fe',
    backgroundColor: 'rgba(77,144,254,.2)',
  },
  feature: {
    code: 'feature',
    avatar: 'F',
    color: '#f953ba',
    backgroundColor: 'rgba(249,83,186,.2)',
  },
  bugfix: {
    code: 'bugfix',
    avatar: 'B',
    color: '#ffb100',
    backgroundColor: 'rgba(255,177,0,.2)',
  },
  release: {
    code: 'release',
    avatar: 'R',
    color: '#00bf96',
    backgroundColor: 'rgba(27,193,35,.2)',
  },
  hotfix: {
    code: 'hotfix',
    avatar: 'H',
    color: '#f44336',
    backgroundColor: 'rgba(244,67,54,.2)',
  },
  custom: {
    code: 'custom',
    avatar: 'C',
    color: '#af4cff',
    backgroundColor: 'rgba(175,76,255,.2)',
  },
}

// 标记列表项
export interface ITagList {
  tagName: string;
  message: string;
  release: {
    description: string;
    tagName: string;
  };
  commitUserImage: string;
  commit: {
    // author: null
    // authorEmail: "admin@example.com"
    // authorName: "Administrator"
    // authoredDate: "2022-01-06 10:09:35"
    committedDate: string;
    // committerEmail: "admin@example.com"
    committerName: string;
    // createdAt: "2022-01-06 10:09:35"
    id: string;
    message: string;
    // parentIds: ["9f6d43e973bc224943ed56949c88a46fd1e47df6"]
    // shortId: "bce1b7dd"
    // stats: null
    // status: null
    // timestamp: null
    // title: string;
    url: string;
  }
}

export interface TagControlProp {
  controlType: 'create' | 'edit' | null;
  tagInfo?: ITagList;
}

// 合并请求列表项
export interface IMergeRequestProp {
  openCount: number;
  mergeCount: number;
  closeCount: number;
  totalCount: number;
  pageResult: {
    content: Array<IMergeRequestList>;
    totalElements: number;
  }
}

export interface IMergeRequestList {
  // assignee: null
  author: {
    name: string;
    id: number;
    webUrl: string;
    username: string;
  };
  commits: Array<any>;
  createdAt: string;
  // description: null
  id: number;
  iid: number; // 应用编码
  // lastCommitSha: null
  // mergeStatus: null
  projectId: number;
  sourceBranch: string;
  sourceProjectId: number;
  state: "merged";
  targetBranch: string;
  targetProjectId: number;
  title: string;
  updatedAt: string;
  // webUrl: null
}

export enum EnvTypeEnum {
  dev = '开发',
  prod = '生产',
  test = '测试',
  uat = '预发',
}

export interface EnvDataProp {
  id: number;
  name: string;
  code: string;
  connect: boolean; // 是否连接
  envType: 'dev' | 'test' | 'uat' | 'prod';
  envTag: string;
  clusterId: number;
  clusterName: string;
}