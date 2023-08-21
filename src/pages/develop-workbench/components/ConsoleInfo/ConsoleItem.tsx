import React, { useMemo } from 'react';
import { Button } from '@middle/ui';
import { PlusOutlined } from '@ant-design/icons';
import styless from './index.less';

interface ConsoleItemProp {
  title: string;
  description: string;
  msgPositionSwitch?: boolean; // 是否给 标题,描述 信息换位置，默认标题在上方
  extraButton?: boolean; // 是否需要右上角按钮 默认没有
  href?: string; // 跳转链接
  onClick?: () => void;
  onExtraClick?: () => void;
}

const ConsoleItem: React.FC<ConsoleItemProp> = ({
  title,
  description,
  msgPositionSwitch,
  extraButton,
  onClick,
  onExtraClick,
}) => {
  return useMemo(() => {
    return (
      <div className={styless.consoleItem} onClick={onClick}>
        {
          msgPositionSwitch && (
            <span className={styless.descriptionMsg}>
              {description}
            </span>
          )
        }
        <span className={styless.titleMsg}>
          {title}
        </span>
        {
          msgPositionSwitch ?? (
            <span className={styless.descriptionMsg}>
              {description}
            </span>
          )
        }
        {
          extraButton && (
            <Button
              className={styless.extraButton}
              shape="circle"
              icon={<PlusOutlined style={{color: '#3167FC'}} />}
              size="large"
              onClick={(e) => {
                onExtraClick?.();
                e.stopPropagation();
              }}
            />
          )
        }
      </div>
    )
  }, [title, onClick])
}

export { ConsoleItem }