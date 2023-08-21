import React, { useState, useEffect, useRef } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Row, Input, Space, Button, Alert } from 'antd';
import { InstanceCount } from './InstanceCount';
import { queryFileReference } from '@/services/maven-repository'
import { MavneItem, IReference } from '@/interfaces/maven-repository';
import styless from '../index.less';
import globalStyless from '@/global.less';

interface ViewReferenceProp {
  dataInfo: MavneItem;
}

const ViewReference: React.FC<ViewReferenceProp> = ({
  dataInfo,
}) => {

  const [version, setVersion] = useState<string>();
  const actionRef = useRef<ActionType>();

  useEffect(() => {
    if(dataInfo) {
      actionRef.current?.reload();
      setVersion(dataInfo.version);
    }
  }, [dataInfo])

  const columns: ProColumns<IReference>[] = [
    {
      title: '包版本号',
      dataIndex: 'version',
    },
    {
      title: '项目空间',
      dataIndex: 'projectName',
      width: 200,
      hideInSearch: true,
    },
    {
      title: '应用名称',
      dataIndex: 'applicationName',
      hideInSearch: true,
    },
    {
      title: '应用编码',
      dataIndex: 'applicationCode',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '分支',
      dataIndex: 'buildBranch',
      hideInSearch: true,
    },
    {
      title: '应用版本',
      dataIndex: 'appVersion',
      hideInSearch: true,
    },
    {
      title: '编译日志',
      dataIndex: 'buildJobUrl',
      hideInSearch: true,
    },
    {
      title: '引用时间',
      dataIndex: 'buildDate',
      hideInSearch: true,
    },
    {
      title: (
        <span>
          运行实例数
          <span className={styless.repositoryTitle}>（可点击查看运行环境和实例信息）</span>
        </span>
      ),
      dataIndex: 'instanceCount',
      hideInSearch: true,
      width: 200,
      align: 'center',
      render: (text, record) => (
        <InstanceCount record={record} />
      )
    },
  ] 

  return (
    <div>
      <Alert
        style={{marginBottom: 16}}
        message={(
          <span>
            可在当前页面查看，
            <span className={globalStyless.dangerColor}>
              该包目前被哪些应用引用，且引用该包的分支和时间
            </span>。
          </span>
        )}
        type="warning" 
        showIcon
      />
      <Row justify='space-between'>
        <span>
          <label>&ensp;包版本号：</label>
          <Input 
            style={{width: 300}}
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            allowClear
          />
        </span>
        <Space>
          <Button onClick={() => {
              setVersion(undefined);
              actionRef.current?.reload();
          }}>
            重置
          </Button>
          <Button type='primary' onClick={() => actionRef.current?.reload()}>
            查询
          </Button>
        </Space>
      </Row>
      <ProTable<IReference>
        actionRef={actionRef}
        className={styless.mavenReferenceTable}
        columns={columns}
        request={async (params = {}, sort, filter) => {
          const { current, pageSize } = params
          return queryFileReference({
            page: current!,
            size: pageSize!,
            artifactId: dataInfo.artifactId,
            version: version,
          }).then(({ data, totalElements }) => {
            return {
              data,
              total: totalElements,
              success: true,
            }
          })
        }}
        columnsState={{
          persistenceKey: 'develop-maven-reference',
          persistenceType: 'localStorage',
        }}
        rowKey="id"
        scroll={{ x: 'max-content' }}
        search={false}
        pagination={{ 
          defaultPageSize: 10,
          size: 'default',
          showSizeChanger: true,
        }}
      />
    </div>
  )
}

export { ViewReference };