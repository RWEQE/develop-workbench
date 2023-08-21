FROM registry.cn-hangzhou.aliyuncs.com/choerodon-tools/frontbase:0.7.0

# 接受外部变量
ARG oneStopDomain=http://kf-itwork.one-stop-platform.devgw.yonghui.cn
ARG tokenCookieKey=kfitwork_access_token
ARG apiDomain=http://api-gateway:8080
ARG oneApiDomain=http://api-gateway:8080

# 运行时的环境变量
ENV oneStopDomain=${oneStopDomain} \
    tokenCookieKey=${tokenCookieKey} \
    apiDomain=${apiDomain} \
    oneApiDomain=${oneApiDomain}


RUN echo "Asia/shanghai" > /etc/timezone;

ADD dist /usr/share/nginx/html

COPY nginx/nginx.conf /etc/nginx/

CMD sed -i "s|http://one.stop.domain|${oneStopDomain}|g" `grep http://one.stop.domain -rl /usr/share/nginx/html` && \
sed -i "s|:tokenCookieKey|${tokenCookieKey}|g" `grep :tokenCookieKey -rl /usr/share/nginx/html` && \
sed -i "s|http://api.domain|${apiDomain}|g" /etc/nginx/nginx.conf && \
sed -i "s|http://oneApi.domain|${oneApiDomain}|g" /etc/nginx/nginx.conf && \
nginx -g 'daemon off;'

#CMD ["nginx", "-g", "daemon off;"]

EXPOSE 80
