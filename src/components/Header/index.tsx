import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, WebsiteHeader } from '@middle/ui';
import { generatePath } from 'react-router';
import Cookie from 'js-cookie';
import { request } from '@/utils/request';
import { ServiceConfig } from '@/config';
import { createHttp } from '@middle/request';
import './index.less';
import { useModel } from 'umi';

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
  const currentUser = useModel('@@initialState')?.initialState?.currentUser;

  const [products, setProducts] = useState<INavList | undefined>(undefined);
  const [linkList, setLinkList] = useState<ILinkItem[]>([]);

  const { realName, imageUrl } = currentUser || {};

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
          title: <a href={item.proUrl} target='_blank'>{item.title}</a>,
        };
      }),
    ];
  }, [products, linkList]);

  const getLinkList = async () => {
    const loginRequest = createHttp({
      url: `/api/openapi/v1/code/openapi-oneStation-title/type/list/login`,
      method: 'post',
    });
    const res: ResType = (await loginRequest.send()) || {};
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

  useEffect(() => {
    const toHomePage = () => {
      // 环境判断：根据各自项目域名自行调整
      if (window.location.href.startsWith('http://kf-itwork')) {
        window.location.href = 'http://kf-itwork.one-stop-platform.devgw.yonghui.cn/';
      } else {
        window.location.href = 'http://itwork2.yonghui.cn';
      }
    };
    const siteLogo = document.querySelector('.middle-site-svg') as HTMLSpanElement;
    const siteTitle = document.querySelector('.middle-site-title') as HTMLLabelElement;
    siteLogo.style.cursor = 'pointer';
    siteTitle.style.cursor = 'pointer';
    siteLogo?.addEventListener('click', toHomePage);
    siteTitle?.addEventListener('click', toHomePage);
  }, []);

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

  return (
    <WebsiteHeader
      style={{ backgroundColor: '#fff' }}
      title="永辉IT效能平台"
      leftNavBars={leftNavs}
      rightNavBars={rightNavBars}
      logo={'icon-itwork'}
      user={{
        userName: realName?.replace(/#\d+$/, '') ?? '登陆',
        avatar: imageUrl,
        dropdown: [{ title: '退出', onClick: onLogout }],
      }}
    />
  );
};

export { Header };
