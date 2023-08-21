/**
 * 分支列表下拉
 */
import React, { useEffect, useState, ReactNode } from 'react';
import { createHttp } from '@middle/request';
import { Form, Select, Space, Input } from '@middle/ui';
import { Typography, Segmented } from 'antd';
const { Option, OptGroup } = Select;
const { Paragraph } = Typography;
import { BranchesOutlined, TagFilled } from '@ant-design/icons';
import _ from 'lodash';
import { FormInstance } from 'antd/es/form';

declare interface IBranchTagSelect {
  name: string;
  label?: string | ReactNode;
  projectId: number;
  appId: number;
  sortBranchTag?: boolean; // 是否区分 分支和标记
  hasHashSwitch?: boolean; // 是否需要 切换到 hash输入框
  form?: FormInstance;
  required?: string; // 必填
  tooltip?: string; // tooltip
  appearance?: 'default' | 'edit'; // 设计风格 'default' / 'edit'
  mode?: 'tags' | 'multiple';
  disabled?: boolean; // 是否禁用
  placeholder?: string; // placeholder
  onChange?: (value: string) => void;
  onData?: (list: Array<{ label: string; value: string; branchType: string; }>) => void;
}

const BranchTagSelect: React.FC<IBranchTagSelect> = ({
  name,
  label,
  projectId,
  appId,
  sortBranchTag,
  hasHashSwitch,
  form,
  required,
  tooltip,
  appearance,
  mode,
  disabled,
  placeholder,
  onChange,
  onData,
}) => {
  const [branchList, setBranchList] = useState<Array<{ label: string; value: string; branchType: string}>>(); // 分支列表
  const [tagList, setTagList] = useState<Array<{ label: string; value: string; branchType: string }>>(); // 标记列表
  const [fieldType, setFieldType] = useState<'branch' | 'hash'>('branch');

  useEffect(() => {
    if(projectId && appId) {
      loadBranchs();
    }
    return () => {
      setFieldType('branch')
    }
  }, [projectId, appId]);

  // 获取分支列表
  const loadBranchs = _.debounce(
    (filterParams = '') => {
      const request = createHttp({
        url: `/api/openapi/v1/code/openapi-devops-listBranchAndTag/type/list`,
        method: 'post',
        data: {
          appId,
          branchName: filterParams,
        },
      });
      request.send().then(
        ({data}: any) => {
          if(sortBranchTag) {
            const branchPart = (data || []).filter(_ =>
              _.branch_type != 'tag'
            ).map((_) => 
              ({ 
                label: _.branch_name, 
                value: _.branch_name,
                branchType: 'branch',
              })
            );
            setBranchList(branchPart);
            const tagPart = (data || []).filter(_ => 
              _.branch_type == 'tag'
            ).map((_) => 
              ({ 
                label: _.branch_name, 
                value: _.branch_name,
                branchType: 'tag',
              })
            );
            setTagList(tagPart);
          } else {
            const list = (data || []).map((_) => ({ label: _.branch_name, value: _.branch_name, branchType: _.branch_type }));
            setBranchList(list);
          }
          onData && onData(data);
        },
        () => {
          setBranchList([]);
          onData && onData([]);
        },
      );
    },
    500,
  )

  const handleFieldChange = (value: any) => {
    form?.resetFields([name]);
    setFieldType(value as 'branch' | 'hash');
  }

  return (
    <Form.Item
      name={name}
      label={
        <Space>
          {label}
          {hasHashSwitch && (
            <Segmented
              value={fieldType}
              options={[
                {
                  label: '分支/标记',
                  value: 'branch',
                },
                {
                  label: 'commit SHA',
                  value: 'hash',
                },
              ]}
              onChange={handleFieldChange}
              size="small"
            />
          )}
        </Space>
      }
      tooltip={tooltip}
      rules={
        required ? [{ required: true, message: required }] : undefined
      }
    >
      {
        fieldType == 'branch' ? (
          <Select
            showSearch
            filterOption={false}
            appearance={appearance || 'default'}
            loading={branchList === void 0}
            mode={mode}
            maxTagCount='responsive'
            placeholder={placeholder || '请选择'}
            getPopupContainer={(triggerNode) => triggerNode.parentElement}
            dropdownStyle={{minWidth: 360}}
            onChange={onChange}
            disabled={disabled}
            onSearch={loadBranchs}
            onFocus={() => loadBranchs()}
          >
            {
              sortBranchTag ? (
                <>
                  <OptGroup label="分支">
                    {
                      branchList?.map(item => (
                        <Option 
                          key={`branch-${item.value}`}
                          value={`branch-${item.value}`}
                          branchtype={item.branchType}
                        >
                          <Paragraph 
                            style={{margin: 0}}
                            ellipsis={{tooltip: item.label}}
                          >
                            <BranchesOutlined />&ensp;{item.label}
                          </Paragraph>
                        </Option>
                      ))
                    }
                  </OptGroup>
                  <OptGroup label="标记">
                    {
                      tagList?.map(item => (
                        <Option 
                          key={`tag-${item.value}`}
                          value={`tag-${item.value}`}
                          branchtype={item.branchType}
                        >
                          <Paragraph 
                            style={{margin: 0}}
                            ellipsis={{tooltip: item.label}}
                          >
                            <TagFilled />&ensp;{item.label}
                          </Paragraph>
                        </Option>
                      ))
                    }
                  </OptGroup>
                </>
              ) : (
                branchList?.map(item => (
                  <Option 
                    key={`${item.branchType}-${item.value}`}
                    value={item.value}
                    branchtype={item.branchType}
                  >
                    <Paragraph 
                      style={{margin: 0}}
                      ellipsis={{tooltip: item.label}}
                    >
                      {
                        item.branchType == 'tag' ?
                        <TagFilled /> : 
                        <BranchesOutlined />
                      }
                      &ensp;{item.label}
                    </Paragraph>
                  </Option>
                ))
              )
            }
          </Select>
        ) : (
          <Input
            appearance={appearance || 'default'}
            placeholder='请输入'
          />
        )
      }
      </Form.Item>
  );
};

export { BranchTagSelect };
