/**
 * 团队空间，异步获取数据下拉展示
 */
import React, { useEffect, useState, ReactNode, CSSProperties } from 'react';
import { createCacheHttp } from '@middle/request';
import { Form, Select, Input } from '@middle/ui';
import globalStyle from '@/styles/global.less';
import { useModel } from 'umi';

declare interface ITeamSpaceSelect {
  name: string | Array<string | number>;
  label?: string | ReactNode;
  required?: string; // 必填
  labelName?: string; // 获取label时使用
  appearance?: string; // 设计风格 'default' / 'edit'
  mode?: 'tags' | 'multiple';
  disabled?: boolean; // 是否禁用
  allowClear?: boolean;
  placeholder?: string; // placeholder
  formItemStyle?: CSSProperties; // Form.Item 的样式
  onChange?: (value: string, options: any ) => void;
  onData?: (list: Array<{ label: string; value: string }>) => void;
}

const TeamSpaceSelect: React.FC<ITeamSpaceSelect> = ({
  name,
  label,
  required,
  labelName,
  appearance,
  mode,
  disabled,
  allowClear = true,
  placeholder,
  formItemStyle,
  onChange,
  onData,
}) => {
  const { initialState } = useModel('@@initialState');
  const { id } = initialState?.currentUser!;
  const [teams, setTeams] = useState<
    undefined | Array<{ label: string; value: string; code: string; }>
  >(undefined);
  useEffect(() => {
    const request = createCacheHttp({
      url: `/api/iam/v1/users/${id}/projects`,
      method: 'get',
    });
    request.send<Array<{ name: string; id: string; code: string }>>().then(
      (list) => {
        const teams = (list || []).map((_) => ({ label: _.name, value: _.id, code: _.code }));
        setTeams(teams);
        onData && onData(teams);
      },
      () => {
        setTeams([]);
        onData && onData([]);
      },
    );
  }, []);

  return (
    <>
      {labelName ? (
        <Form.Item noStyle={true} name={labelName} hidden={true}>
          <Input />
        </Form.Item>
      ) : null}
      <Form.Item shouldUpdate={() => false} noStyle={true}>
        {({ setFieldsValue }) => {
          return (
            <Form.Item
              name={name}
              label={label}
              style={formItemStyle}
              rules={
                required ? [{ required: true, message: required }] : undefined
              }
            >
              <Select
                className={appearance == 'edit' ? globalStyle.editInput : ''}
                showSearch
                optionLabelProp={'label'}
                optionFilterProp="children"
                loading={teams === void 0}
                mode={mode}
                maxTagCount='responsive'
                placeholder={placeholder}
                allowClear={allowClear}
                getPopupContainer={(triggerNode) => triggerNode.parentElement}
                onChange={
                  labelName
                    ? (value, option) => {
                        setFieldsValue({
                          [labelName!]: (
                            option as { label: string; value: string }
                          ).label,
                        });
                        onChange && onChange(value, option);
                      }
                    : onChange
                }
                disabled={disabled}
                filterOption={(input: string, option: any) => 
                  JSON.stringify(option.nameandcode)
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
              >
                {
                  teams?.map(item => (
                      <Select.Option
                        key={item.value}
                        value={item.value}
                        label={item.label}
                        nameandcode={`${item.label} ${item.code}`}
                      >
                        <>
                          <div>{item.label}</div>
                          <div style={{ color: 'rgb(191, 191, 191)', fontSize: 12 }}>{item.code}</div>
                        </>
                      </Select.Option>
                    )
                  )
                }
              </Select>
            </Form.Item>
          );
        }}
      </Form.Item>
    </>
  );
};

export { TeamSpaceSelect };
