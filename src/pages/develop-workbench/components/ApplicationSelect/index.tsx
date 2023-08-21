import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, Form, Divider, Typography, Pagination, Row, Input, Empty, Spin } from '@middle/ui';
import { CheckCard } from '@ant-design/pro-card';
import { AppstoreFilled } from '@ant-design/icons';
import { useLocalStorageState } from 'ahooks';
const { Text } = Typography;
import { SearchForm } from '@/components/SearchForm';
import { TeamSpaceSelect } from '@/components/TeamSpaceSelect';
import { AppMultipleSelect } from './AppMultipleSelect';
import { queryAppList } from '@/services/common';
import { IApplicaitonList } from '@/interfaces/develop-workbench';
import { useModel, useLocation } from 'umi';
import { Location } from 'history';
import styless from './index.less';

interface filterParamsLocalStroage {
  projectIds: Array<number>;
  appIds: Array<number>;
}

interface ApplicationSelectProp {
  curApp: IApplicaitonList | undefined;
  onSelectApp: (appItem: IApplicaitonList) => void;
}

const ApplicationSelect: React.FC<ApplicationSelectProp> = ({
  curApp,
  onSelectApp,
}) => {

  const [appList, setAppList] = useState<IApplicaitonList[]>([]); // 应用列表
  const [pageCurrent, setPageCurrent] = useState<number>(1); // 分页 当前第几页
  const [total, setTotal] = useState<number>(0); // 应用 总数
  const [listLoading, setListLoading] = useState<boolean>(false); // 应用列表loading
  const [appSelectParams, setAppSelectParams] = useLocalStorageState<filterParamsLocalStroage>(
    'develop_appSelectParams', {
      defaultValue: { projectIds: [], appIds: [] }
    }
  )
  const location = useLocation() as Location & {
    query: { projectId?: string, appId: string };
  };
  const [form] = Form.useForm();
  const { id } = useModel('@@initialState')?.initialState?.currentUser!;

  useEffect(() => {
    form.setFieldsValue(
      {
        projectIds: location?.query?.projectId ? [parseInt(location?.query?.projectId)] : (appSelectParams.projectIds || []),
        appIds: location?.query?.appId ? [parseInt(location?.query?.appId)] : appSelectParams.appIds,
      }
    )
  }, [])

  useEffect(() => {
    loadAppList();
  }, [pageCurrent])
  
  // 获取 应用列表
  const loadAppList = useCallback(
    () => {
      const { projectIds, appIds } = form.getFieldsValue();
      setAppSelectParams({
        projectIds,
        appIds,
      })
      setListLoading(true)
      queryAppList({
        userId: id,
        page: pageCurrent,
        size: 5,
        projectIds,
        appIds,
      }).then(
        (res) => {
          const { data, totalElements } = res;
          setAppList(data);
          if(data?.length > 0) {
            handleSelectApp(data[0]);
          }
          setTotal(totalElements);
        }
      ).finally(
        () => setListLoading(false)
      )
    },
    [id, pageCurrent, curApp],
  )

  // 搜索
  const onSearch = useCallback(() => {
    if(pageCurrent == 1) {
      loadAppList();
    } else {
      setPageCurrent(1);
    }
  }, [pageCurrent])

  // 选择某个应用
  const handleSelectApp = useCallback((appItem: IApplicaitonList | any) => {
    if(appItem) {
      onSelectApp(appItem);
    }
  }, [])

  return useMemo(() => {
    return (
      <Card bodyStyle={{ padding: '1px 12px' }}>
        <SearchForm
          formInstance={form}
          hasRefresh
          onSearch={onSearch}
          onReFresh={loadAppList}
        >
          <TeamSpaceSelect
            name='projectIds'
            label='产品项目'
            placeholder='请选择'
            mode='multiple'
          />
          <AppMultipleSelect
            name="appIds"
            label="应用服务"
            projectName='projectIds'
            placeholder="请输入应用名称/应用编码"
          />
        </SearchForm>
        <Divider style={{margin: '0 0 12px'}} />
        <Spin spinning={listLoading}>
          <CheckCard.Group
            className={styless.checkApplicationGroup}
            value={curApp as any}
            onChange={(value) => handleSelectApp(value)}
          >
            {
              appList.length > 0 ?
                appList.map((item: IApplicaitonList, index: number) => {
                  return (
                    <CheckCard
                      key={item.id}
                      className={styless.checkApplication}
                      title={(
                        <div className={styless.applicationTitle} >
                          <div className={styless.titleIcon}>
                            &emsp;<AppstoreFilled />
                          </div>
                          <div className={styless.titleAppMsg}>
                            <Text ellipsis={{ tooltip: item.code }}>
                              {item.code}
                            </Text>
                            <Text
                              ellipsis={{ tooltip: item.name }}
                            >
                              {item.name}
                            </Text>
                          </div>
                        </div>
                      )}
                      description={
                        <div className={styless.applicationDescription}>
                          <Divider className={styless.descriptionDivider} />
                          <Text
                            ellipsis={{ tooltip: item.projectName }}
                          >
                            &emsp;{item.projectName}
                          </Text>
                        </div>
                      }
                      value={item}
                    />
                  )
                }) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )
            }
          </CheckCard.Group>
          {
            total > 0 && (
              <Row justify="end" style={{paddingBottom: '8px'}}>
                共 {total} 个&emsp;
                <Pagination
                  simple
                  current={pageCurrent}
                  pageSize={5}
                  total={total}
                  onChange={(page) => setPageCurrent(page)}
                />
              </Row>
            )
          }
        </Spin>
      </Card>
    );
  }, [appList, curApp, pageCurrent, total, listLoading, appSelectParams]);
};

export { ApplicationSelect };
