import React, { useMemo } from 'react';
import { Modal } from '@middle/ui';
import styless from './index.less';

const MavenBuildTips: React.FC<{
  visible: boolean;
  onCancel: () => void;
}> = ({
  visible,
  onCancel,
}) => {
  return useMemo(() => {
    return (
      <Modal
        visible={visible}
        width={960}
        centered
        bodyStyle={{maxHeight: '1000px'}}
        footer={null}
        onCancel={onCancel}
      >
        <div className={styless.mavenTips}>
          <h3>注意事项</h3>
          <div>1. 原云创的服务在开发工作台构建时默认使用平台上的缓存仓库,不使用Maven远程仓库. 仅当平台缓存仓库文件不存在时,才请求远程仓库.</div>
          <div>2. 如果当前服务编译依赖其他的服务产生的包,请依赖的服务先执行构建将jar/pom安装到平台缓存库.</div>
          <div>3. 如果当前服务构建产生的jar/pom需要提供给其他服务依赖使用,请将jar/pom上传到Maven远程仓库,以便研发本地开发使用. 
            <a href='http://public-service.confluence.gw.yonghui.cn/pages/viewpage.action?pageId=32386077' target={'_blank'}>
              (参考文档)
            </a>
          </div>
          <div>4.release仓库同一版本号仅允许上传一次</div>
          <div>5.建议生产环境构建release版本, 而非snatshop</div>
          <br />

          <h4>Maven仓库 (gorup包括snatshops,release)</h4>

          <p>开发环境仓库地址</p>
          <div style={{paddingLeft: '1rem'}}>
            <div>远程仓库-Group: http://mvn.yonghui.cn/nexus/content/groups/yh-dev</div>
            <div>远程仓库-snatshops: http://mvn.yonghui.cn/nexus/content/repositories/operation-dev/</div>
            <div>远程仓库-release: http://mvn.yonghui.cn/nexus/content/repositories/operation-release/</div>
            <div>平台缓存: repository-operation/yh-dev</div>
          </div>
          <br />

          <p>测试环境仓库地址</p>
          <div style={{paddingLeft: '1rem'}}>
            <div>远程仓库-Group: http://mvn.yonghui.cn/nexus/content/groups/yh-sit</div>
            <div>远程仓库-snatshops: http://mvn.yonghui.cn/nexus/content/repositories/operation-sit/</div>
            <div>远程仓库-release: http://mvn.yonghui.cn/nexus/content/repositories/operation-release/</div>
            <div>平台缓存: repository-operation/yh-sit</div>
          </div>
          <br />

          <p>预发环境仓库地址</p>
          <div style={{paddingLeft: '1rem'}}>
            <div>远程仓库-Group: http://mvn.yonghui.cn/nexus/content/groups/yh-uat</div>
            <div>远程仓库-snatshops: http://mvn.yonghui.cn/nexus/content/repositories/operation-uat/</div>
            <div>远程仓库-release: http://mvn.yonghui.cn/nexus/content/repositories/operation-release/</div>
            <div>平台缓存: repository-operation/yh-uat</div>
          </div>
          <br />

          <p>生产环境仓库地址</p>
          <div style={{paddingLeft: '1rem'}}>
            <div>远程仓库-Group: http://mvn.yonghui.cn/nexus/content/groups/yh-prod</div>
            <div>远程仓库-snatshops: http://mvn.yonghui.cn/nexus/content/repositories/operation-pord/</div>
            <div>远程仓库-release: http://mvn.yonghui.cn/nexus/content/repositories/operation-release/</div>
            <div>平台缓存: repository-operation/yh-prod</div>
          </div>
        </div>
      </Modal>
    )
  }, [visible])
}

export { MavenBuildTips };