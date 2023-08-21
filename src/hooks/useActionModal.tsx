import { useState, useMemo, useCallback } from 'react';

interface ActionModalProp<ActionType, IData> {
  visible: boolean;
  actionType?: ActionType;
  dataInfo?: IData;
}

function useActionModal<ActionType extends string, IData>(
  actionModalMap: { [key in ActionType]: any },
  reload: () => void,
) {
  const [actionControl, setActionControl] = useState<
    ActionModalProp<ActionType, IData>
  >({ visible: false });
  const actionKeys = Object.keys(actionModalMap) as Array<ActionType>;

  const open = useCallback((actionType: ActionType, dataInfo?: IData) => {
    setActionControl({
      visible: true,
      actionType,
      dataInfo,
    });
  }, []);

  const close = useCallback(() => {
    setActionControl({ visible: false });
  }, []);

  // 弹窗们
  const modals = actionKeys.map((actionType) => {
    return useMemo(() => {
      const ModalComponent = actionModalMap[actionType];
      return (
        <ModalComponent
          {...actionControl}
          key={actionType}
          onCancel={close}
          onSuccess={reload}
        />
      );
    }, [actionControl.visible && actionControl.actionType == actionType]);
  });

  return {
    actionControl,
    open,
    close,
    modals,
  };
}

export { useActionModal };
