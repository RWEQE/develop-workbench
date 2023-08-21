export default [
  {
    path: '/develop-workbench',
    name: '开发工作台',
    icon: 'tool',
    component: './develop-workbench',
  },
  {
    path: '/code-check',
    name: '代码审核',
    icon: 'check',
    component: '@/pages/code-check',
  },
  {
    path: '/maven-repository',
    name: 'maven仓库管理',
    icon: 'home',
    component: '@/pages/maven-repository',
  },
  // {
  //   path: '/admin',
  //   name: 'admin',
  //   icon: 'crown',
  //   access: 'canAdmin',
  //   component: './Admin',
  //   routes: [
  //     {
  //       path: '/admin/sub-page',
  //       name: 'sub-page',
  //       icon: 'smile',
  //       component: './Welcome',
  //     },
  //     {
  //       component: './404',
  //     },
  //   ],
  // },
  {
    path: '/',
    redirect: '/develop-workbench',
  },
  {
    component: './404',
  },
];
