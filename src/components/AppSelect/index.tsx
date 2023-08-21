import React, { useState, useEffect } from 'react';
import { Form, Select, Input } from '@middle/ui';
import { FormInstance } from 'antd';
import { queryAppList } from '@/services/common';
import { useModel } from 'umi';
import _ from 'lodash';

interface ISelectApp {
  id: number;
  name: string;
  code: string;
  organizationId: number;
  projectId: number;
  projectName: string;
  projectCode: string;
}

interface AppSelectProp {
  name: string;
  label: string;
  required?: string;
  mode?: 'tags' | 'multiple';
  initialAppInfo?: ISelectApp; // 默认应用值
  formInstance?: FormInstance<any>;
  allowClear?: boolean;
  formItemStyle?: object;
  getPopupContainerBody?: boolean;
  onSelect?: (
    value: number,
    options: { label: string; value: number; data: ISelectApp },
  ) => void;
  onChange?: (
    value: string,
    options: { label: string; value: number; data: ISelectApp },
  ) => void;
}

interface IAppList {
  label: string;
  value: number;
  data: ISelectApp;
}

const AppSelect: React.FC<AppSelectProp> = ({
  name,
  label,
  required,
  mode,
  initialAppInfo,
  formInstance,
  allowClear,
  formItemStyle,
  getPopupContainerBody,
  onSelect,
  onChange,
}) => {
  const { initialState } = useModel('@@initialState');
  const { id } = initialState?.currentUser!;
  const [appList, setAppList] = useState<Array<IAppList> | undefined>(
    initialAppInfo ?
    [{
      label: `${initialAppInfo?.name}(${initialAppInfo?.code})`,
      value: initialAppInfo?.id,
      data: initialAppInfo,
    }] : undefined
  );
  const [form] = formInstance ? [formInstance] : Form.useForm();

  useEffect(() => {
    if (id && initialAppInfo) {
      form.setFieldsValue({
        [name]: initialAppInfo.id,
        projectId: initialAppInfo.projectId,
      })
      loadAppList('', initialAppInfo);
    }
  }, [id, initialAppInfo]);

  // 查询应用列表
  const loadAppList = _.debounce((filterParam = '', initialAppInfo = undefined) => {
    queryAppList({
      userId: id,
      page: 1,
      size: 20,
      searchText: filterParam,
    }).then(({ data }) => {
      const list = data.map((item: any) => {
        return {
          label: `${item.name}(${item.code})`,
          value: item.id,
          data: item,
        };
      })
      if(initialAppInfo && !list.find((app: IAppList) => app.value == initialAppInfo.id)) {
        list.unshift({
          label: `${initialAppInfo.name}(${initialAppInfo.code})`,
          value: initialAppInfo.id,
          data: initialAppInfo,
        })
      }
      setAppList(list);
    });
  }, 500);

  // 选择应用要把项目ID也带上
  const handleSelect = (value: number, option: { label: string; value: number; data: ISelectApp }) => {
    const { data } = option;
    form.setFieldsValue({
      projectId: data.projectId,
    })
    onSelect?.(value, option);
  }

  return (
    <>
      <Form.Item 
        noStyle={true} 
        name={'projectId'} 
        hidden={true}
        initialValue={initialAppInfo?.projectId}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={label}
        name={name}
        style={formItemStyle}
        initialValue={initialAppInfo?.id}
        rules={required ? [{ required: true, message: '请选择应用' }] : []}
      >
        <Select
          showSearch
          mode={mode}
          filterOption={false}
          options={appList}
          loading={appList === void 0}
          placeholder='请选择'
          allowClear={allowClear}
          getPopupContainer={(triggerNode) => {
            return getPopupContainerBody
              ? document.body
              : triggerNode.parentElement;
          }}
          onChange={onChange as any}
          onSelect={handleSelect}
          onSearch={loadAppList}
        />
      </Form.Item>
    </>
  );
};

export { AppSelect };
