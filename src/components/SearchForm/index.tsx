import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, Form, Row, Col, Switch } from '@middle/ui';
import { Button } from 'antd';
import { FormInstance } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import classes from './index.less';

type SearchFormProp = {
  formInstance?: FormInstance<any>;
  hasExpand?: boolean; // 展开
  hasRefresh?: boolean; // 刷新
  hasAutoRefresh?: boolean; // 自动刷新
  defaultAutoRefresh?: boolean; // 初始 是否开启自动刷新
  onSearch?: (values: any) => void; // 查询按钮回调
  onReFresh?: () => void; // 刷新按钮方法
  onReFreshChange?: (value: boolean) => void; // 切换自动刷新开关回调
  onReset?: () => void; // 重置按钮回调
};

const SearchForm: React.FC<SearchFormProp> = ({
  formInstance,
  hasExpand,
  hasRefresh,
  hasAutoRefresh,
  defaultAutoRefresh,
  onSearch,
  onReFresh,
  onReFreshChange,
  onReset,
  children,
}) => {

  const [expand, setExpand] = useState<boolean>(true); // 是否展开状态
  const [intervalValue, setIntervalValue] = useState<any>(); // 自动刷新 计时器 实例
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(!!defaultAutoRefresh); // 当前是否打开了 自动刷新功能
  const [form] = formInstance ? [formInstance] : Form.useForm();

  useEffect(() => {
    if(isAutoRefresh) {
      onAutoRefresh(true)
    }
    return () => {
      clearInterval(intervalValue);
    }
  }, [])

  // 自动刷新
  const onAutoRefresh = useCallback((checked: boolean) => {
    setIsAutoRefresh(checked)
    if (checked) {
      onReFresh?.();
      intervalValue && clearInterval(intervalValue);
      const myVal = setInterval(() => {
        onReFresh?.();
      }, 5000);
      setIntervalValue(myVal);
    } else {
      intervalValue && clearInterval(intervalValue);
    }
  }, [intervalValue, onReFresh])

  // 生成 表单内容项
  const getFields = () => {
    const fields: React.ReactNode[] = [];
    React.Children.forEach(children, (item, index) => {
      if (expand) {
        fields.push(
          <Col
            key={index}
            className={classes.colItem}
            span={8}
          >
            {React.cloneElement(item as React.ReactElement, {
              key: index,
            })}
          </Col>,
        );
      } else {
        if (index < 4) {
          fields.push(
            <Col
              key={index}
              className={classes.colItem}
              span={8}
            >
              {React.cloneElement(item as React.ReactElement, {
                key: index,
              })}
            </Col>,
          );
        }
      }
    });
    return fields;
  };

  // 重置表单
  const handleReset = useCallback(() => {
    form.resetFields();
    onSearch?.({});
    if (onReset) {
      onReset();
    }
  }, [onSearch]);

  return useMemo(() => {
    return (
      <Card
        className={classes.searchForm}
        bodyStyle={{ padding: '4px 0px' }}
        bordered={false}
      >
        <Form
          form={form}
          layout={'inline'}
          className={classes.widthAll}
          colon={false}
          onFinish={onSearch}
        >
          <Row className={classes.rowItem}>
            {getFields()}
            <Col className={classes.btnColItem}>
              <Button className={classes.btnReset} onClick={handleReset}>
                重置
              </Button>
              <Button
                className={classes.btnSearch}
                type="primary"
                htmlType="submit"
              >
                查询
              </Button>
              {
                hasExpand && (
                  <Button
                    className={classes.btnExpand}
                    type="link"
                    onClick={() => setExpand((expand) => !expand)}
                  >
                    {expand ? <>收起</> : <>展开</>}
                  </Button>
                )
              }
              {
                hasRefresh && (
                  <Button
                    type='text'
                    onClick={onReFresh}
                  >
                    刷新
                    <ReloadOutlined />
                  </Button>
                )
              }
              {
                hasAutoRefresh && (
                  <span>
                    &emsp;
                    自动刷新
                    &ensp;
                    <Switch 
                      checked={isAutoRefresh} 
                      onChange={(value) => {
                        onReFreshChange?.(value);
                        onAutoRefresh(value)
                      }} 
                    />
                    &ensp;
                  </span>
                )
              }
            </Col>
          </Row>
        </Form>
      </Card>
    );
  }, [children, expand, isAutoRefresh, defaultAutoRefresh, onSearch, onReFresh, form]);
};

export { SearchForm };
