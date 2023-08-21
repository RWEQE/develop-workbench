import axios from 'axios';
import Cookie from 'js-cookie';
import { ServiceConfig } from '@/config';
import { message } from 'antd';
// import { switchUrl } from '@utils/index.js'

axios.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  },
)

axios.interceptors.response.use(
  response => {
    return response
  },
  error => {
    return Promise.resolve(error.response)
  },
)

function checkStatus(response) {
  const { status, data: { message: errorMsg, msg } } = response || {};
  if (response && status === 403) {
    //接口 403 没有权限
    
    setTimeout(() => {
      message.destroy();
      message.error(errorMsg || msg || '用户暂无操作权限');
    }, 0);
    return Promise.reject(response);
  }
  if (status === 401) { //接口 401 需要重新登陆
    message.error('登录状态已失效,请重新登录');
    window.location.href = `${ServiceConfig.oneStopDomain}${ServiceConfig.loginPath}?redirecturi=${window.location.href}`;
    return;
  }
  if (response && ([200, 204, 304].includes(response.status))) {
    return response
    // 如果不需要除了data之外的数据，可以直接 return response.data
  }
  // 异常状态下，把错误信息返回去
  return Promise.reject({
    status: -404,
    message: '网络异常',
  })
}

function checkCode(res) {
  // 校验前后端约定的状态码
  if(res.data && res.data.failed) {
    message.error(res.data?.message || '接口错误');
    return Promise.reject(res.data)
  }
  // 400000 - 500000  400001
  if (res.data && /^(4|5)[0-9]*/.test(res.data.code)) {
    if (!res.data) {
    }
    return Promise.reject(res.data)
  }
  return res.data
}
export const post = (url: string, data: any) => {
  let reqConfig = {
    method: 'post',
    // baseURL: global_.baseUrl,
    url,
    data: JSON.stringify(data),
    withCredentials: false, // 允许携带cookie
    headers: {
      Authorization: Cookie.get(ServiceConfig.tokenCookieKey) || '',
      'Content-Type': 'application/json; charset=UTF-8',
    },
  }
  return axios({
    ...reqConfig,
  })
    .then(response => {
      return checkStatus(response)
    })
    .then(res => {
      return checkCode(res)
    })
}

export const get = (url: string, params: any) => {
  let reqConfig = {
    method: 'get',
    url,
    params, // get 请求时带的参数
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      Authorization: Cookie.get(ServiceConfig.tokenCookieKey) || '',
    },
  }
  return axios({
    ...reqConfig,
  })
    .then(response => {
      return checkStatus(response)
    })
    .then(res => {
      return checkCode(res)
    })
}
export const deletes = (url, params) => {
  return axios({
    method: 'delete',
    //baseURL: global_.baseUrl,
    url,
    params,
    data: params,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
  })
    .then(response => {
      return checkStatus(response)
    })
    .then(res => {
      return checkCode(res)
    })
}
export const put = (url, data) => {
  return axios({
    method: 'put',
    // baseURL: global_.baseUrl,
    url,
    data: JSON.stringify(data),
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      Authorization: Cookie.get(ServiceConfig.tokenCookieKey) || '',
    },
  })
    .then(response => {
      return checkStatus(response)
    })
    .then(res => {
      return checkCode(res)
    })
}
