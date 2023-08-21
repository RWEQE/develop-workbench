import React, { useState, useEffect, useMemo } from 'react';
import { Avatar, Popover, Table, Tag } from 'antd';
import { Skeleton } from '@middle/ui';
import { IReference } from '@/interfaces/maven-repository';
import { queryInstanceEnvs } from '@/services/maven-repository';

interface InstanceCountProp {
  record: IReference;
}

const statusObj = {
  running: '运行中',
  deleted: '删除',
  failed: '失败',
  stopped: '已停止',
  operating: '处理中',
};

const InstanceCount: React.FC<InstanceCountProp> = ({
  record,
}) => {

  const [visible, setVisible] = useState<boolean>(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    if(visible && record) {
      queryInstanceEnvs({
        appId: record.applicationId,
        versionId: record.appVersionId,
      }).then(
        ({ data }) => {
          setData(data)
        },
        () => {
          setData([])
        }
      )
    }
  }, [visible])

  return useMemo(() => {
    return (
      <Popover
        visible={visible}
        placement='left'
        trigger={'click'}
        onVisibleChange={(visible) => {
          if(record.instanceCount > 0) {
            setVisible(visible)
          }
        }}
        content={
          data.length > 0 ?
          (
            <Table
              rowKey={'instanceId'}
              dataSource={data}
              columns={[
                {
                  title: '实例状态',
                  dataIndex: 'instanceStatus',
                  render: (text) => (
                    <Tag color={text === 'running' ? 'green' : ''}>
                      {statusObj[text]}
                    </Tag>
                  )
                },
                {
                  title: '运行环境',
                  dataIndex: 'envName'
                },
                {
                  title: '实例信息',
                  dataIndex: 'instanceCode'
                },
              ]}
              pagination={false}
            />
          ) : (<Skeleton style={{width: 500}} />)
        }
      >
        <Avatar 
          style={{ 
            color: '#1890ff', 
            backgroundColor: '#e6f7ff', 
            borderColor: '#91d5ff',
            cursor: 'pointer',
          }}
        >
          {record.instanceCount}
        </Avatar>
      </Popover>
    )
  }, [record, visible, data])
}

export { InstanceCount };