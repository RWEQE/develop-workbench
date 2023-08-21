// promise.allsettled 的 .then 数据结构
export interface PromiseAllSettledRes {
  status: 'fulfilled' | 'rejected';
  value?: any; // 接口返回结果
  reason?: any; // 理由
}