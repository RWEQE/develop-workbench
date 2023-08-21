import React, { useMemo } from 'react';
import { BuildApplication } from './BuildApplication';
import { AppBuildScript } from './AppBuildScript';
import { BranchManagement } from './BranchManagement';
import { TagManagement } from './TagManagement';
import { CiVariable } from './CiVariable';
import { MergeRequest } from './MergeRequest';
import { CreateBranch } from './CreateBranch';
import { CreateTag } from './CreateTag';
import { ModalTypeMap, ModalControlProp } from '@/interfaces/develop-workbench';


interface ModalsProp {
  modalControl: ModalControlProp,
  onAppInfoReload: () => void;
  onTableReload: () => void;
  onLoadConsoleInfo: (funcType: 'mergeRequest' | 'tag' | 'branch') => void;
  onActionModalClose: () => void;
}

const ModalComponentMap = {
  buildApp: BuildApplication,
  appBuildScript: AppBuildScript,
  branchManagment: BranchManagement,
  tagManagement: TagManagement,
  ciVariable: CiVariable,
  mergeRequest: MergeRequest,
  createBranch: CreateBranch,
  createTag: CreateTag,
}

const Modals: React.FC<ModalsProp> = ({
  modalControl,
  onAppInfoReload,
  onTableReload,
  onLoadConsoleInfo,
  onActionModalClose,
}) => {

  return (
    <div>
      {
        ModalTypeMap.map((modalType) => {
          return useMemo(
            () => {
              const ModalComponent = ModalComponentMap[modalType];
              return (
                <ModalComponent
                  {...modalControl}
                  key={modalType}
                  onAppInfoReload={onAppInfoReload}
                  onTableReload={onTableReload}
                  onLoadConsoleInfo={onLoadConsoleInfo}
                  onCancel={onActionModalClose}
                />
              )
            }, 
            [
              modalType == modalControl.modalType && modalControl.visible
            ]
          )
        })
      }
    </div>
  )
}

export { Modals }