import React, { useMemo } from 'react';
import { Alert, Button } from 'antd';
import { InfoCircleFilled } from '@ant-design/icons';
import globalStyless from '@/global.less';

const CommonAlert: React.FC<any> = () => {
  return useMemo(() => {
    return (
      <Alert
        style={{marginTop: 16}}
        message="温馨提示:"
        description={(
          <div>
            <div>
              <span className={globalStyless.dangerColor}>
                2023年3月6日后，所有的Snapshot包静态化（当前版本不再允许覆盖），有新的变更只能发布新的版本号。
              </span>
              （例：3月6日之前的，account-api/1.0.0-SNAPSHOT/包无法更新，需要发布新的account-api/1.0.1-SNAPSHOT/版本号来使用。）此方法解决一级部门内部各系统间的包升级版本问题。
            </div>
            <div>
              <span className={globalStyless.dangerColor}>
                2023年3月6日后，各研发团队不允许新增跨一级部门的Snapshot包的依赖，只能依赖release包。 
              </span>
              此方法解决跨一级部门的包升级版本问题。
            </div>
            <div>
              同时开发工作台，将下线deploy功能，
              <span className={globalStyless.dangerColor}>
              请在“开发工作台”下的“Maven仓库管理”页面发布包。
              </span>
            </div>
            <span style={{color: 'rgba(0, 0, 0, 0.45)'}}>
              附: 本地编译构建Maven制品
            </span>
            <Button 
              type='link'
              target='_blank'
              href='http://public-service.confluence.gw.yonghui.cn/pages/viewpage.action?pageId=83143602'
            >
              {'操作手册 >>'}
            </Button>
          </div>
        )}
        type="info"
        icon={<InfoCircleFilled />}
        showIcon
      />
    )
  }, [])
}

export { CommonAlert };