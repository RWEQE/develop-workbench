import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, WebsiteHeader } from '@middle/ui';
import { generatePath } from 'react-router';
import Cookie from 'js-cookie';
import { useApplicationContext } from '@/context/ApplicationContext';
import { request } from '@/utils/request';
import { ServiceConfig } from '@/config';
import { createHttp } from '@middle/request';
import './header.less';

const rightNavBars = [
  {
    title: (
      <a
        href={`${ServiceConfig.oneStopDomain}${ServiceConfig.docPath}`}
        target={'_blank'}
        rel="noreferrer"
      >
        文档中心
      </a>
    ),
  },
  {
    title: (
      <a
        href={`${ServiceConfig.oneStopDomain}${ServiceConfig.sharingCommunityPath}`}
        target={'_blank'}
        rel="noreferrer"
      >
        分享社区
      </a>
    ),
  },
];

type INavList = Parameters<typeof WebsiteHeader>[0]['leftNavBars'];

interface ILinkItem {
  des: string;
  devUrl?: string;
  id: number;
  proUrl: string;
  title: string;
}

interface ResType {
  code?: number;
  data?: any;
  message?: string;
}

const Header: React.FC = () => {
  const [products, setProducts] = useState<INavList | undefined>(undefined);
  const [linkList, setLinkList] = useState<ILinkItem[]>([]);

  const { realName, avatar } = useApplicationContext();

  const getLinkList = async () => {
    const request = createHttp({
      url: `/api/openapi/v1/code/openapi-oneStation-title/type/list/login`,
      method: 'post',
    });
    const res: ResType = (await request.send()) || {};
    if (res?.code !== 200000) return;
    if (res?.data && res?.data.length > 0) {
      setLinkList(res?.data);
    }
  };

  const onLogout = useCallback(() => {
    Modal.confirm({
      title: '确定退出登录吗？',
      onOk: () => {
        Cookie.remove(ServiceConfig.tokenCookieKey, {
          domain: ServiceConfig.cookieDomain,
        });
        location.href = ServiceConfig.oneStopDomain;
      },
    });
  }, []);

  const leftNavs = useMemo(() => {
    return [
      {
        title: '产品',
        children: products,
      },
      {
        title: (
          <a
            href={`${ServiceConfig.oneStopDomain}${ServiceConfig.consolePath}`}
            target={'_blank'}
            rel="noreferrer"
          >
            总控制台
          </a>
        ),
      },
      ...linkList?.map((item) => {
        return {
          title: <a href={item.proUrl}>{item.title}</a>,
        };
      }),
    ];
  }, [products, linkList]);

  useEffect(() => {
    request
      .get<{
        data: {
          menuName: string;
          isDisable: boolean;
          productInfoList: {
            productName: string;
            isHot: boolean;
            isNew: boolean;
            isDisable: boolean;
            id: number;
          }[];
        }[];
      }>('/api/itwork-frame/v1/product/tree')
      .then(({ data = [] }) => {
        const group: INavList = [];
        data.map((productGroup) => {
          const { menuName, isDisable, productInfoList = [] } = productGroup;
          if (!isDisable || true) {
            const children: INavList = [];
            (productInfoList || []).map((product) => {
              const { productName, isDisable, id } = product;
              if (!isDisable || true) {
                children.push({
                  title: (
                    <a
                      href={`${ServiceConfig.oneStopDomain}${generatePath(
                        ServiceConfig.productPath,
                        {
                          id,
                        },
                      )}`}
                      target={'_blank'}
                      rel="noreferrer"
                    >
                      {productName}
                    </a>
                  ),
                });
              }
            });
            if (children.length) {
              group.push({
                title: menuName,
                children: children,
              });
            }
          }
        });
        setProducts(group);
      });

    getLinkList();
  }, []);

  return useMemo(() => {
    return (
      <WebsiteHeader
        title="永辉IT效能平台"
        leftNavBars={leftNavs}
        rightNavBars={rightNavBars}
        logo={'icon-itwork'}
        user={{
          userName: realName?.replace(/#\d+$/, '') ?? '登陆',
          avatar: avatar,
          dropdown: [
            {
              title: '退出',
              onClick: onLogout,
            },
          ],
        }}
      />
    );
  }, [products, realName, avatar, linkList]);
};

export { Header };
