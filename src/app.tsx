import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import type { RunTimeLayoutConfig } from 'umi';
import defaultSettings from '../config/defaultSettings';
import { config, onRequestError } from '@middle/request';
import { Header } from './components/Header';
import { ServiceConfig } from './config';
import Cookies from 'js-cookie';
import { queryCurrentUser, quertProjects } from './services/common';
import { Icon, message } from '@middle/ui';
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { init } from '@yh/yh-sauron';

const isProduction = window.location.host.indexOf('public-service') > -1 ? true : false;

Sentry.init({
  dsn: "https://21abc6fdc225442f8bf44444a479cb2b@sentry.yonghuivip.com/133",
  integrations: [new Integrations.BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  release: 'develop-workbench-1.1.4',
  enabled: isProduction,
  ignoreErrors: ['ResizeObserver loop limit exceeded'],
});
Sentry.setExtra( 'projectOwner', '15952038980');


// 开启性能分析需要在初始化中额外加入useWebPerformance、platform_name、webPerformanceRouteList三个参数，webPerformanceClientType参数选填。
init({
  // 开启性能监控的参数
  useWebPerformance: true, // 是否开启性能分析埋点上报功能
  platform_name: 'develop-workbench', // 项目英文名，不确定是否唯一可以去索伦平台查看
  // webPerformanceRouteList 在索伦平台对应查询的字段是 url
  webPerformanceRouteList: [
    // 归并路径：监听的路由路径列表，有归并的操作。
    //         比如不写'/bury/edit'但是写了'/bury'，那么'/bury/edit'路由的数据会被归并到'/bury'做平均数据的处理。
    //         如果路由数组是['/']只有一个根路由，那么所有页面的数据都会归并到'/'这个路由里面，以此类推。
    // 匹配顺序：假如在数组中匹配到多个路径符合条件，默认取数组中最后一个匹配到的路径，所以建议将短的路径写在前面，长的路径写在后面。
    '/',
    '/develop-workbench',
    '/code-check',
    '/maven-repository',
  ],
  webPerformanceClientType: 'Other', // 区分客户端环境（ V3.0.3 开始支持 ） alipayminiprogram，wechatminiprogram，iOS，Android，Other之一，不填默认值Other

  // 初始化方法需要的参数，参数详情参见上文，其他初始化参数是否需要自行判断
  env: isProduction ? 'online' : 'dev', // 环境变量
  app_name: '永辉生活', // app名称，一般是'永辉生活'
  project_name: 'yh_life', // 索伦平台的组名，一般是'yh_life'
});

/** 引入font-icon  */
Icon.createDefaultIcon({
  scriptUrl: '//at.alicdn.com/t/font_2746801_7pn2qmxkrk.js',
});

/** 开发环境配置cookie */
// if (isDev) {
//   // 设置cookie
//   Cookies.set(ServiceConfig.tokenCookieKey, 'c76027c8-df2a-42d8-915c-d675bb7116ea');
// }

onRequestError((response) => {
  if (response.status === 403) {
    setTimeout(() => {
      message.destroy();
      message.error('用户暂无操作权限');
    }, 0);
  }
});

/** 配置middle-request */
config(
  {
    loginRoute: `${ServiceConfig.oneStopDomain}${ServiceConfig.loginPath}`,
    redirectKey: 'redirecturi',
    headers: {
      Authorization: `cookie.${ServiceConfig.tokenCookieKey}`,
    },
    cookieKeys: [ServiceConfig.tokenCookieKey],
  },
  [
    {
      pathRule: '/api/*',
      successCodes: ['200', 'S200'],
      loginExpireHttpCode: [401],
    },
    {
      pathRule: '/one_api/*',
      errorCodes: [400],
      loginExpireHttpCode: [401],
    },
  ],
);

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * 初始化全局数据
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  projectList?: Array<{id: number, name: string}>;
  loading?: boolean;
}> {
  // 获取当前用户信息
  const currentUser = await queryCurrentUser()
  let projectList = []
  if(currentUser?.id) {
    projectList = await quertProjects(currentUser.id);
  }
  return {
    currentUser,
    projectList,
    settings: defaultSettings,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = () => {
  return {
    headerRender: () => <Header />,
    footerRender: undefined,
    disableContentMargin: false,
    waterMarkProps: { content: '永辉大科技' },
    title: '开发工作台',
    logo: () => null,
    menuHeaderRender: (logo, title) => (
      <div>
        {logo}
        {title}
      </div>
    ),
    menuFooterRender: (props) => {
      return (
        <a
          style={{
            display: 'flex',
            height: 48,
            alignItems: 'center',
            color: 'rgba(0, 0, 0, 0.65)',
            borderTop: '1px solid rgb(238, 238, 238)',
          }}
          href="http://public-service.confluence.gw.yonghui.cn/pages/viewpage.action?pageId=60395251"
          target={'_blank'}
          key="docs"
        >
          <Icon style={{margin: '0px 10px 0px 16px', fontSize: '16px'}} type='icon-read' />
          {!props?.collapsed && '操作手册'}
        </a>
      )
    },
    onPageChange: () => {
      // 如果没有登录，重定向到 login
      const token = Cookies.get(ServiceConfig.tokenCookieKey);
      if (!token) {
        window.location.href = `${ServiceConfig.oneStopDomain}${ServiceConfig.loginPath}?redirecturi=${window.location.href}`;
      }
    },
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return <>{children}</>;
    },
    // ...initialState?.settings,
  };
};
