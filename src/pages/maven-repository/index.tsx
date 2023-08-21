import React, { ReactNode, useCallback, useRef } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Space, Button, Badge, Typography, Alert } from 'antd';
const { Paragraph } = Typography;
import { MavenDrawer } from './components/MavenDrawer';
import { EditDescription } from './components/EditDescription';
import { TextDetail } from './components/TextDetail';
import { useActionModal } from '@/hooks/useActionModal';
import { queryMavenList, queryEnvEnum, queryUsers } from '@/services/maven-repository';
import { MavneItem, EnumItem, MavenActionType } from '@/interfaces/maven-repository';
import styless from './index.less';
import { useModel } from 'umi';

const actionModalMap = {
  editDescription: EditDescription,
}

const MavenRepository: React.FC<any> = () => {

  const actionRef = useRef<ActionType>();
  const projectId = useModel('@@initialState')?.initialState?.projectList![0]?.id; // 当前用户的 首个项目id
  const { open, modals } = useActionModal<MavenActionType, MavneItem>(
    actionModalMap, () => actionRef.current?.reload()
  );

  const formatRecord = useCallback((record: MavneItem) => {
    const fileTypeList = []
    if(record.uploadJar) {
      fileTypeList.push(1);
    }
    if(record.uploadPom) {
      fileTypeList.push(2)
    }
    if(record.uploadResource) {
      fileTypeList.push(3)
    }
    return {
      ...record,
      fileType: fileTypeList,
    }
  }, []);

  const columns: ProColumns<MavneItem>[] = [
    {
      title: 'Group ID',
      dataIndex: 'groupId',
      order: 5,
    },
    {
      title: 'Artifact ID',
      dataIndex: 'artifactId',
      order: 4,
      width: 200,
    },
    {
      title: '版本号',
      dataIndex: 'version',
      order: 2,
    },
    {
      title: '环境信息',
      dataIndex: 'env',
      order: 6,
      width: 100,
      formItemProps: {
        label: '环境名称'
      },
      valueType: 'select',
      request: () => {
        return queryEnvEnum().then(
          ({ data }) => data?.map((item: EnumItem) => {
            return {
              label: item.desc,
              value: item.code,
            }
          })
        )
      }
    },
    {
      title: '库类型',
      dataIndex: 'repositoryTypeStr',
      hideInSearch: true,
    },
    {
      title: '地址',
      dataIndex: 'fileUrl',
      hideInSearch: true,
      render: (_: ReactNode) => (
        <Paragraph
          style={{width: 200, wordBreak: 'break-all', marginBottom: 0}}
          ellipsis={{ rows: 2, tooltip: _ }}
        >
          {_}
        </Paragraph>
      )
    },
    {
      title: '推送人',
      dataIndex: 'createByName',
      order: 1,
      fieldProps: { 
        showSearch: true, 
        filterOption: false,
        mode: 'multiple',
        maxTagCount: 'responsive',
        debounceTime: 500,
      },
      request: (params: any) => {
        return queryUsers(params?.keyWords).then(
          ({content}) => {
            return content?.map((item: { realName: string; id: string }) => ({
              label: item.realName,
              value: item.id,
            }));
          },
          () => []
        )
      }
    },
    {
      title: '变更描述',
      dataIndex: 'description',
      hideInSearch: true,
      render: (text, record) => (
        <TextDetail value={record.description} />
      )
    },
    {
      title: '上传时间',
      dataIndex: 'creationDate',
      hideInSearch: true,
    },
    {
      title: '上传状态',
      dataIndex: 'uploadStatusDesc',
      hideInSearch: true,
      width: 100,
      render: (uploadStatusDesc: ReactNode) => {
        if (uploadStatusDesc === "已完成") {
          return <Badge status="success" text={'上传成功'} />;
        } else if (uploadStatusDesc === "上传中") {
          return <Badge status="warning" text={'上传中'} />;
        } else {
          return <Badge status="error" text={'上传失败'} />;
        }
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 150,
      fixed: 'right',
      render: (text, record, _, action) => {
        const formatMavenItem = formatRecord(record)
        return [
          <MavenDrawer type='view' mavenItem={formatMavenItem} />,
          <a onClick={() => open('editDescription', record)}>修改描述</a>
        ]
      },
    },
  ] 

  return (
    <div>
      <ProTable<MavneItem>
        actionRef={actionRef}
        columns={columns}
        cardBordered
        request={async (params = {}, sort, filter) => {
          const { current, pageSize, createByName, ...resetParams } = params
          return queryMavenList({
            pageNo: current! - 1,
            pageSize: pageSize!,
            projectId: projectId || 0,
            userIds: createByName,
            ...resetParams,
          }).then(({ data: { content, totalElements }}) => {
            return {
              data: content,
              total: totalElements,
              success: true,
            }
          })
        }}
        columnsState={{
          persistenceKey: 'develop-maven-repository',
          persistenceType: 'localStorage',
        }}
        rowKey="id"
        scroll={{ x: 'max-content' }}
        search={{ span: 8, collapsed: false }}
        pagination={{ 
          defaultPageSize: 10,
          size: 'default',
          showSizeChanger: true,
        }}
        headerTitle={(
          <Space>
            <span>maven库地址：</span>
            <Button 
              type='link'
              href='http://mvn.yonghui.cn/nexus/content/groups/yh-dev/'
              target='_blank'
            >
              开发
            </Button>
            <Button 
              type='link'
              href='http://mvn.yonghui.cn/nexus/content/groups/yh-sit/'
              target='_blank'
            >
              测试
            </Button>
            <Button 
              type='link'
              href='http://mvn.yonghui.cn/nexus/content/groups/yh-prod/'
              target='_blank'
            >
              生产
            </Button>
          </Space>
        )}
        toolBarRender={() => [
          <MavenDrawer
            type='create'
            reload={() => actionRef.current?.reload()}
          />
        ]}
        tableExtraRender={() => (
          <Alert 
            message={(
              <span>
                该页面仅展示<a>通过平台上传的历史记录，更多的数据</a>
                ，请到以下地址查询，“
                <Button 
                  className={styless.linkBtnPadding}
                  type='link'
                  href='http://mvn.yonghui.cn/nexus/content/groups/yh-dev/'
                  target='_blank'
                >
                  开发
                </Button>”、“
                <Button 
                  className={styless.linkBtnPadding}
                  type='link'
                  href='http://mvn.yonghui.cn/nexus/content/groups/yh-sit/'
                  target='_blank'
                >
                  测试
                </Button>”、“
                <Button 
                  className={styless.linkBtnPadding}
                  type='link'
                  href='http://mvn.yonghui.cn/nexus/content/groups/yh-prod/'
                  target='_blank'
                >
                  生产
                </Button>”。
              </span>
            )}
            type="info" 
            showIcon
          />
        )}
      />
      {modals}
    </div>
  )
}

export default MavenRepository