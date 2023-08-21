import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Select,
  Spin,
  Breadcrumb,
  ScrollContent,
  Empty,
  Modal,
} from '@middle/ui';
import { createCacheHttp } from '@middle/request';
import { RouteContext } from '@middle/ui/es/layout-x';
import { useTeamSpaceContext } from '@/context/TeamSpaceContext';
import { useApplicationContext } from '@/context/ApplicationContext';
import styles from './index.less';
import { getPrivilige } from '@/services/common';

declare interface ITeamSpace {
  id: number;
  name: string;
  code: string;
}

const TeamLayout: React.FC = (props) => {
  const { children } = props;
  const { breadcrumb } = useContext(RouteContext) || {};
  const { routes } = breadcrumb ?? {};
  const [loading, setLoading] = useState(true);

  const {
    teamSpaceId,
    setTeamSpace,
    teamSpaceList,
    setTeamSpaceList,
    teamItem,
    setTeamItem,
    setPrivilige,
  } = useTeamSpaceContext();

  const { uid } = useApplicationContext();
  useEffect(() => {
    const request = createCacheHttp({
      url: `/api/iam/v1/users/${uid}/projects?type=type/product-system`,
      method: 'get',
    });
    request.send<Array<ITeamSpace>>().then(
      (data) => {
        const teams = (data || []).map((_) => ({
          label: _.name,
          value: _.id,
          code: _.code,
        }));
        setTeamSpaceList(teams);
        // 查找是否已存在
        const exist =
          teamSpaceId && teams.find((team) => team.value === teamSpaceId);
        if (!exist) {
          setTeamItem({
            projectId: teams?.[0]?.value,
            projectName: teams?.[0]?.label,
            projectCode: teams?.[0]?.code,
          });
          setTeamSpace(teams?.[0]?.value);
        }
        setLoading(false);
      },
      () => {
        setTeamSpaceList([]);
        setLoading(false);
      },
    );
  }, []);

  const loadPrivilige = async () => {
    const { code, data, message } = await getPrivilige();
    if (code === 'S200' && data) {
      setPrivilige(data);
    } else {
      Modal.error(message);
    }
  };

  useEffect(() => {
    if (teamSpaceId) {
      loadPrivilige();
    }
  }, [teamSpaceId]);

  return useMemo(() => {
    const length = teamSpaceList?.length;
    if (!loading && void 0 === teamSpaceId) {
      return (
        <div className={styles.emptyBody}>
          <Empty
            image={require('@/assets/empty.svg')}
            description={<label>抱歉，您当前未加入任何团队空间</label>}
            className={styles.emptyPage}
          />
        </div>
      );
    }

    return (
      <div className={styles.container}>
        <Spin spinning={loading}>
          {loading ? null : (
            <div className={styles.header}>
              当前空间：
              <Select
                disabled={
                  children !== null &&
                  typeof children === 'object' &&
                  ['add', 'edit', 'publish'].filter((item) =>
                    children.props.location.pathname.includes(item),
                  ).length > 0
                }
                className={styles.headerSelect}
                options={teamSpaceList}
                value={length ? teamSpaceId : undefined}
                bordered={false}
                onChange={(value) => {
                  setTeamSpace(value);
                  const obj = teamSpaceList?.find(
                    (team) => team.value === value,
                  );
                  setTeamItem({
                    projectId: obj?.value,
                    projectName: obj?.label,
                    projectCode: obj?.code,
                  });
                }}
              />
            </div>
          )}
          <ScrollContent className={styles.body} key={teamSpaceId}>
            {loading ? null : <Breadcrumb minLength={1} routes={routes} />}
            {length && !loading ? children : null}
          </ScrollContent>
        </Spin>
      </div>
    );
  }, [loading, children, teamSpaceId, teamSpaceList]);
};

export { TeamLayout };
