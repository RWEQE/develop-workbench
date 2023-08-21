import React, { useMemo, useCallback } from 'react';
import { Cascader, Tag, Space, Form, Popconfirm } from 'antd';
import { IApplicaitonList, EnvDataProp, EnvTypeEnum } from '@/interfaces/develop-workbench/index';

interface JumpDeployButtonProp {
  appInfo: IApplicaitonList;
  envsMap: Map<string, EnvDataProp[]>;
}

const JumpDeployButton: React.FC<JumpDeployButtonProp> = ({
  appInfo,
  envsMap,
}) => {

  const [form] = Form.useForm();

  // 环境选择 气泡卡片
  const options = useMemo(() => (
    ['dev', 'test', 'uat', 'prod'].filter(
      item => [...envsMap.keys()].indexOf(item) > -1
    ).map((key) => ({
      key,
      label: EnvTypeEnum[key],
      value: key,
      children: envsMap.get(key)?.map((item: EnvDataProp) => ({
        key: item.id,
        value: item.id,
        item: item,
        label: (
          <div>
            <div>
              {item.name}
              {!item.connect && item.envTag === 'normal' && (
                <Tag color="error" style={{ marginLeft: 10 }}>
                  未连接
                </Tag>
              )}
            </div>
            <Space style={{ fontSize: '12px', color: '#00000073', fontWeight: 400 }} size="middle">
              <span>{`NameSpace: ${item.code}`}</span>
              <span>{`Cluster: ${item.clusterName}`}</span>
            </Space>
          </div>
        )
      }))
    }))
  ), [appInfo, envsMap]);

  const handleConfirm = useCallback(() => {
    const { envId } = form.getFieldsValue();
    if(!envId) {
      return;
    }
    const isDevelop = window.location.host.indexOf('kf-itwork') >= 0;
    window.open(
      (isDevelop ? `http://kf-itwork.deploy-workbench-front.devgw.yonghui.cn` : `http://public-service.deploy-workbench-front.gw.yonghui.cn`)
        + `/deploy/workbench?projectId=${appInfo?.projectId}&envId=${envId[1]}&appParams=${appInfo?.id}`
    )
  }, [appInfo])

  return useMemo(() => {
    return (
      <Popconfirm
        icon={false}
        title={(
          <Form form={form}>
            <Form.Item
              name='envId'
              label='选择环境'
              style={{marginBottom: 0}}
            >
              <Cascader
                style={{minWidth: 300}}
                options={options}
                placeholder="请选择环境名称"
                displayRender={(label, selectedOptions: any) => {
                  return (
                    <>
                      {selectedOptions[0]?.label} / {selectedOptions[1]?.item?.name || ''}
                    </>
                  );
                }}
                showSearch={{
                  filter: (input: string, option: any) => {
                    return (
                      `${option[1]?.item?.name}-${option[1]?.item?.id}-${option[1]?.item?.code}`
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    );
                  },
                  render: (input: string, path: any) => {
                    return `${path[0]?.label} / ${path[1]?.item?.name || ''}`
                  }
                }}
                getPopupContainer={(triggerNode) => triggerNode.parentElement}
              />
            </Form.Item>
          </Form>
        )}
        onConfirm={handleConfirm}
      >
        <a>部署</a>
      </Popconfirm>
    )
  }, [appInfo, envsMap, options])
}

export { JumpDeployButton };