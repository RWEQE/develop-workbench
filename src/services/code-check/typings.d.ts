declare namespace CodeCheckAPI {
  type ItemInfo = {
    crCode?: string; //代码审核code
    reviewId?: string; //审核id
    issueId?: string; //需求id
    issueName?: string; //需求名称
    projectId?: string; //项目id
    projectCode?: string; //项目编码
    projectName?: string; //项目名称
    creatorName?: string; //创建人名称
    creatorDisplayName?: string; //创建人名称
    moderatorName?: string; //审核人展示名称
    moderatorDisplayName?: string; //创建人名称
    crStatus?: 'Draft' | 'Review' | 'Success' | 'Dead'; //审核状态，Draft=未审核，Review=审核中，Success=审核成功，Dead=审核失败
    createDate?: string; //创建时间
    lastUpdatedDate?: string; //最后更新时间
    fisheyeUrl?: string; //fisheye审核跳转链接
  };

  type Detail = {
    auth?: string;
    moderator?: string;
    authDisplayName?: string;
    moderatorDisplayName?: string;
    fisheyeProjectKey?: string;
    fisheyeProjectName?: string;
    issueUrl?: string;
    summary?: string;
    issueNum?: string;
    issueId?: number;
    projectName?: string;
    createDate?: string;
    lastUpdateDate?: string;
    reviewBranchList: {
      originBranch?: string;
      branchName?: string;
      appCode?: string;
      repositoryName?: string;
      projectName?: string;
      projectCode?: string;
      appName?: string;
      projectId?: number;
    }[];
    crStatus?: string;
    projectCode?: string;
  };
}
