/**
 * 平台列表仅组织层管理员和PMO拥有权限
 */
import React, { useEffect, useMemo } from 'react';
import { AppLayout } from '@middle/ui';
import MenuDataList from '@/menu';
import type { RouteComponentProps } from 'react-router';
import type { IAppCtx } from '@/context/ApplicationContext';
import { ApplicationContext } from '@/context/ApplicationContext';
import { Header } from '@/layouts/Header';
import { useSafeState } from 'ahooks';
import { request } from '@/utils/request';
import { BaseConfigProvider } from '@middle/provider';
import { TeamSpaceContext } from '@/context/TeamSpaceContext';
import { TeamLayout } from '@/layouts/TeamLayout';

const Layout: React.FC<RouteComponentProps<any>> = (props) => {
  const { children, ...extra } = props;
  const [user, setUser] = useSafeState<IAppCtx | undefined>();

  useEffect(() => {
    console.log('MenuDataList', MenuDataList);
    request.get('/api/iam/v1/users/self').then((data) => {
      const { loginName, id, imageUrl, organizationId, organizationCode, realName } = data;
      // 获取角色权限
      request
        .get(`/api/iam/v1/organizations/${organizationId}/role_members/users/${id}`)
        .then((list) => {
          const _pmCodes = (list || []).map((_: { code: string }) => _.code);
          setUser({
            loginName: loginName,
            realName: realName,
            uid: id,
            avatar: imageUrl,
            organizationId: organizationId,
            organizationCode: organizationCode,
            pmCodes: _pmCodes,
          });
        });
    });
  }, []);

  return useMemo(() => {
    return (
      <ApplicationContext user={user}>
        <BaseConfigProvider arrowMode={'solid'}>
          <AppLayout
            {...extra}
            headerRender={() => {
              return <Header />;
            }}
            key={JSON.stringify(user)}
            menuData={MenuDataList}
            waterMark={'永辉大科技'}
            title={'网关管理平台'}
            loading={!user}
            collapsedButtonMode={'side'}
          >
            {user ? (
              <TeamSpaceContext>
                <TeamLayout>{children}</TeamLayout>
              </TeamSpaceContext>
            ) : null}
          </AppLayout>
        </BaseConfigProvider>
      </ApplicationContext>
    );
  }, [props, user]);
};

export default Layout;
