import React, { useContext } from 'react';

export declare interface IAppCtx {
  loginName: string;
  realName: string;
  uid: string;
  avatar: string;
  organizationId: number;
  organizationCode: string;
  pmCodes: string[];
}

const Context = React.createContext<IAppCtx | undefined>(undefined);

declare interface IApplicationContextProps {
  user?: IAppCtx;
}

const ApplicationContext: React.FC<IApplicationContextProps> = ({
  children,
  user,
}) => {
  return <Context.Provider value={user}>{children}</Context.Provider>;
};

const useApplicationContext = () => {
  return (useContext(Context) || {}) as IAppCtx;
};

export { ApplicationContext, useApplicationContext };
