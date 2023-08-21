/**
 * 控制TeamSpace 选择
 */
import React, { Dispatch, useCallback, useContext, useState } from 'react';
import { useLocalStorageState } from 'ahooks';
import { useApplicationContext } from '@/context/ApplicationContext';

type ScopeOption = {
  label: string;
  value: number;
  code: string;
};

export interface ITeamItem {
  projectId: number | undefined;
  projectName: string | undefined;
  projectCode: string | undefined;
}

declare interface ITeamSpaceCtx {
  teamSpaceId?: number;
  teamItem?: ITeamItem;
  setTeamSpace: (teamSpaceId: number) => void;
  setTeamItem: (item: ITeamItem) => void;
  teamSpaceList?: Array<ScopeOption>;
  setTeamSpaceList: Dispatch<Array<ScopeOption> | undefined>;
  addTeamSpace: (teamSpace: ScopeOption) => void;
  privilige: { create: boolean; edit: boolean; sync: boolean };
  setPrivilige: (item: any) => void;
}

const Context = React.createContext<ITeamSpaceCtx>(
  null as unknown as ITeamSpaceCtx,
);

const TeamSpaceContext: React.FC = ({ children }) => {
  const [teamSpaceId, setTeamSpace] = useLocalStorageState<number | undefined>(
    `team`,
  );

  const [teamItem, setTeamItem] = useLocalStorageState<ITeamItem | undefined>(
    `teamItem`,
  );

  const [teamSpaceList, setTeamSpaceList] = useState<
    undefined | Array<ScopeOption>
  >(undefined);

  const [privilige, setPrivilige] = useState({
    create: false,
    edit: false,
    sync: false,
  });

  const addTeamSpace = useCallback((teamSpace: ScopeOption) => {
    setTeamSpaceList((teamSpaceList) => {
      return teamSpaceList
        ? ([] as ScopeOption[]).concat(teamSpaceList).concat(teamSpace)
        : [teamSpace];
    });
  }, []);

  return (
    <Context.Provider
      value={{
        teamSpaceId,
        setTeamSpace,
        teamSpaceList,
        setTeamSpaceList,
        addTeamSpace,
        teamItem,
        setTeamItem,
        privilige,
        setPrivilige,
      }}
    >
      {children}
    </Context.Provider>
  );
};

const useTeamSpaceContext = () => {
  return useContext(Context);
};

export { TeamSpaceContext, useTeamSpaceContext };
