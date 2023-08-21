import React, { useState, useEffect } from 'react';
import { Form, Select } from 'antd';
import { queryAllAppList } from '@/services/common';
import { IApplicaitonList } from '@/interfaces/develop-workbench';
import { useModel } from 'umi';
import _ from 'lodash';

interface AppMultipleSelectProp {
  name: string;
  label: string;
  projectName: string;
  placeholder?: string;
}

interface InnerAppMultipleSelectProp extends Omit<AppMultipleSelectProp, 'projectName'> {
  projectIds: number[];
}

const InnerAppMultipleSelect: React.FC<InnerAppMultipleSelectProp> = ({
  name,
  label,
  projectIds,
  placeholder,
}) => {

  const [appList, setAppList] = useState<IApplicaitonList[]>([]);
  const { id } = useModel('@@initialState')?.initialState?.currentUser!;

  useEffect(() => {
    if(projectIds) {
      loadAppList();
    }
  }, [projectIds])

  // 获取 应用列表
  const loadAppList = _.debounce((filterParams: string = '') => {
    queryAllAppList({
      userId: id,
      projectIds,
      searchText: filterParams,
    }).then(
      (res) => {
        const { data } = res;
        setAppList(data);
      }
    )
  }, 500)

  return (
    <Form.Item
      name={name}
      label={label}
    >
      <Select
        showSearch
        optionLabelProp='label'
        placeholder={placeholder || '请选择'}
        mode={'multiple'}
        maxTagCount={'responsive'}
        filterOption={false}
        allowClear
        onSearch={loadAppList}
      >
        {
          appList.map((appItem) => (
              <Select.Option key={appItem.id} value={appItem.id} label={appItem.name}>
                <>
                  <div>{appItem.name}</div>
                  <div style={{ color: 'rgb(191, 191, 191)', fontSize: 12 }}>{appItem.code}</div>
                </>
              </Select.Option>
            )
          )
        }
      </Select>
    </Form.Item>
  )
}

const AppMultipleSelect: React.FC<AppMultipleSelectProp> = (props) => {
  const { projectName } = props

  return (
    <Form.Item
      noStyle={true}
      shouldUpdate={(pre, next) => pre[projectName] !== next[projectName]}
    >
      {({ getFieldValue }) => {
        const projectIds = getFieldValue(projectName)
        return (
          <InnerAppMultipleSelect
            {...props}
            projectIds={projectIds}
          />
        )
      }}
    </Form.Item>
  )
}

export { AppMultipleSelect };