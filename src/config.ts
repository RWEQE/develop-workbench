// 外部服务配置，部署时替换

const ServiceConfig = {
  oneStopDomain: 'http://one.stop.domain', // 部署时replace
  consolePath: '/console/boardhome', // 总控制台
  docPath: '/doc', //文档中心
  sharingCommunityPath: '/community', //分享社区
  productPath: '/product/:id',
  loginPath: '/login',
  tokenCookieKey: ':tokenCookieKey', // token对应cookieKey，不同环境需要替换
  cookieDomain: '.yonghui.cn',
};

if (process.env.NODE_ENV !== 'production') {
  ServiceConfig.oneStopDomain = 'http://kf-itwork.one-stop-platform.devgw.yonghui.cn';
  ServiceConfig.tokenCookieKey = 'kfitwork_access_token';
  ServiceConfig.cookieDomain = '.yonghui.cn';
}

export { ServiceConfig };
