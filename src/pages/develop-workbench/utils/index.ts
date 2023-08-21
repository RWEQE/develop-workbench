// 判断分支名称属于哪种类型，feature/bugfix/release/hotfix/custom
export const getBranchNameType = (branchName: string) => {
  if(branchName == 'master') {
    return 'master'
  } else if(/^feature.*/.test(branchName)) {
    return 'feature'
  } else if(/^bugfix.*/.test(branchName)) {
    return 'bugfix'
  } else if(/^release.*/.test(branchName)) {
    return 'release'
  } else if(/^hotfix.*/.test(branchName)) {
    return 'hotfix'
  } else {
    return 'custom'
  }
}

// 获取分支的 真实名字
export const getBranchRealName = (branchName: string = '') => {
  const branchNameSplitList = branchName.split('-')
  const type = branchNameSplitList[0]
  if(type == 'branch') {
    return branchName.substring(7)
  } else if (type == 'tag') {
    return branchName.substring(4)
  } else if(branchNameSplitList.length == 1) {
    return branchName
  } else {
    return ''
  }
}