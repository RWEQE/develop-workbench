// https://umijs.org/config/
import { defineConfig } from 'umi';
import { join } from 'path';
const SentryWebpackPlugin = require('@sentry/webpack-plugin');

import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';

const { REACT_APP_ENV } = process.env;

export default defineConfig({
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  devtool: "source-map",
  layout: {
    // https://umijs.org/zh-CN/plugins/plugin-layout
    // locale: true,
    siderWidth: 208,
    ...defaultSettings,
  },
  // https://umijs.org/zh-CN/plugins/plugin-locale
  locale: {
    // default zh-CN
    default: 'zh-CN',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@ant-design/pro-layout/es/PageLoading',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes,
  // esbuild is father build tools
  // https://umijs.org/plugins/plugin-esbuild
  esbuild: {},
  title: false,
  ignoreMomentLocale: true,
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    '@border-radius-base': '4px',
    '@card-radius': '0',
    '@border-color-split': '@grey-6',
    '@tabs-title-font-size': '16px',
    '@table-header-cell-split-color': 'transparent', // TODO 后续antd相关变量修改成css变量，支持不同项目runtime重置。

    '@middle-menu-arrow-color': '@grey-3',
    '@middle-sub-menu-color': '@grey-2',
    '@menu-item-color': '@grey-1',

    '@blue-1': '#F0F7FF', // 主题
    '@blue-2': '#E0EFFF',
    '@blue-3': '#B8D7FF',
    '@blue-4': '#8FBCFF',
    '@blue-5': '#669eff',
    '@blue-6': '#3C7AF7',
    '@blue-7': '#285BD1',
    '@blue-8': '#183fab',
    '@blue-9': '#0C2885',
    '@blue-10': '#08195e',

    '@grey-1': '#2B354A',
    '@grey-2': '#525865',
    '@grey-3': '#838B98',
    '@grey-4': '#AAAFB9',
    '@grey-5': '#CED2D8',
    '@grey-6': '#E7E8EB',
    '@grey-7': '#F2F3F5',
    '@grey-8': '#F5F6F7',
    '@grey-9': '#fafafa',
    '@white': '#ffffff',
  },
  cssModulesTypescriptLoader: {
    mode: 'emit',
  },
  cssLoader: {
    localsConvention: 'camelCaseOnly',
  },
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  // Fast Refresh 热更新
  // devtool: 'source-map',
  fastRefresh: {},
  openAPI: [
    {
      requestLibPath: "import { request } from 'umi'",
      // 或者使用在线的版本
      // schemaPath: "https://gw.alipayobjects.com/os/antfincdn/M%24jrzTTYJN/oneapi.json"
      schemaPath: join(__dirname, 'oneapi.json'),
      mock: false,
    },
    {
      requestLibPath: "import { request } from 'umi'",
      schemaPath: 'https://gw.alipayobjects.com/os/antfincdn/CA1dOm%2631B/openapi.json',
      projectName: 'swagger',
    },
  ],
  nodeModulesTransform: { type: 'none' },
  mfsu: {},
  webpack5: {},
  exportStatic: {},
  chainWebpack(config, args) {
    if (process.env.NODE_ENV === 'production') {
      config.plugin('sentry').use(SentryWebpackPlugin, [
        {
          release: 'develop-workbench-1.1.4', //SENTRY_V
          include: './dist', //指向打包后js文件夹
          configFile: '../.sentryclirc', // 指向我们的配置文件
          urlPrefix: '~/static', // 指线上看js的路径前缀
          ignore: ['node_modules'],
        },
      ]);
    }
  },
});
