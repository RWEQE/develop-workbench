import React, { useState, useCallback, useRef } from 'react';
import { ApplicationSelect } from './components/ApplicationSelect';
import { ConsoleInfo, ConsoleInfoRef } from './components/ConsoleInfo';
import { HomeList, HomeListRef } from './components/HomeList';
import { CommonAlert } from '@/components/CommonAlert';
import { Modals } from './Modals';
import { IApplicaitonList, ModalControlProp } from '@/interfaces/develop-workbench/index';

const DevelopWorkbench: React.FC<any> = (props) => {

  const [curApp, setCurApp] = useState<IApplicaitonList>(); // 当前选中的 应用
  const consoleInfoRef = useRef<ConsoleInfoRef>(null); // 控制台信息 组件 ref
  const homeListRef = useRef<HomeListRef>(null); // 表格 组件 ref
  const [modalControl, setModalControl] = useState<ModalControlProp>({visible: false});

  // 打开弹窗
  const onActionModalOpen = useCallback((modalType) => {
    setModalControl({
      modalType,
      appInfo: curApp,
      visible: true,
    })
  },[curApp])

  // 关闭弹窗
  const onActionModalClose = useCallback(() => {
    setModalControl({ visible: false })
  },[])

  // 刷新 应用 控制台信息 数据
  const onAppInfoReload = useCallback(() => {
    consoleInfoRef.current?.reload?.();
  }, [consoleInfoRef])

  // 刷新 应用 控制台信息 某项 数据
  const onLoadConsoleInfo = useCallback((funcType: 'mergeRequest' | 'tag' | 'branch') => {
    consoleInfoRef.current?.reloadConsoleInfo?.(funcType);
  }, [consoleInfoRef])

  // 刷新 应用 流水线列表 数据
  const onTableReload = useCallback(() => {
    homeListRef.current?.reload?.();
  }, [homeListRef])

  return (
    <>
      <ApplicationSelect
        curApp={curApp}
        onSelectApp={(appItem: IApplicaitonList) => setCurApp(appItem)}
      />
      <CommonAlert />
      <ConsoleInfo
        curApp={curApp!}
        onActionModalOpen={onActionModalOpen}
        ref={consoleInfoRef}
      />
      <HomeList
        curApp={curApp!}
        ref={homeListRef}
      />
      <Modals
        modalControl={modalControl}
        onAppInfoReload={onAppInfoReload}
        onTableReload={onTableReload}
        onLoadConsoleInfo={onLoadConsoleInfo}
        onActionModalClose={onActionModalClose}
      />
    </>
  );
};

export default DevelopWorkbench;
