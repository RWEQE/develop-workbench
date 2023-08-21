/**
 * 需求迭代，异步获取数据下拉展示
 */
import React, { useEffect, useState, CSSProperties } from 'react';
import { createHttp } from '@middle/request';
import { Form, Select, SelectProps, Input } from '@middle/ui';
import globalStyle from '@/styles/global.less';

declare interface IIterationSelect {
  name: string | Array<string | number>;
  label?: string;
  labelName?: string;
  required?: string; // 必填
  spaceName?: string | Array<string | number>; // 依赖的团队空间名称
  appearance?: string; // 设计风格 'default' / 'edit'
  disabled?: boolean; // 是否禁用
  allowClear?: boolean;
  placeholder?: string; // placaholder
  formItemStyle?: CSSProperties; // Form.Item 的样式
  onChange?: (value: string, option: any) => void;
}

declare interface IIterationInnerSelect
  extends Omit<IIterationSelect, 'spaceName' | 'labelName'> {
  spaceValue?: string | number;
  onValueChange?: (
    value: string,
    option: { label: string; value: string },
  ) => void;
}

const InnerIterationSelect: React.FC<IIterationInnerSelect> = ({
  name,
  label,
  required,
  spaceValue,
  appearance,
  disabled,
  allowClear = true,
  placeholder,
  formItemStyle,
  onValueChange,
}) => {
  const [sources, setSources] = useState<
    undefined | Array<{ label: string; value: string }>
  >(undefined);

  useEffect(() => {
    if (spaceValue) {
      const request = createHttp({
        url: '/api/openapi/v1/code/openapi-queryIterationList/type/list',
        method: 'post',
        data: {
          teamSpaceId: spaceValue,
          status: 'wait,processing',
        },
      });
      setSources(undefined);
      request.send<{ data: Array<{ name: string; id: string }> }>().then(
        ({ data: list }) => {
          setSources((list || []).map((_) => ({ label: _.name, value: _.id })));
        },
        () => {
          setSources([]);
        },
      );
    } else {
      setSources([]);
    }
  }, [spaceValue]);

  return (
    <Form.Item
      name={name}
      label={label}
      style={formItemStyle}
      rules={required ? [{ required: true, message: required }] : undefined}
    >
      <Select
        showSearch
        className={appearance == 'edit' ? globalStyle.editInput : ''}
        optionFilterProp="children"
        options={sources}
        loading={sources === void 0}
        disabled={disabled}
        allowClear={allowClear}
        placeholder={placeholder}
        getPopupContainer={(triggerNode) => triggerNode.parentElement}
        onChange={onValueChange as SelectProps<any>['onChange']}
        filterOption={(input: string, option: any) =>
          JSON.stringify(option)
            .toLowerCase()
            .indexOf(input.toLowerCase()) >= 0
        }
      />
    </Form.Item>
  );
};

const IterationSelect: React.FC<IIterationSelect> = (props) => {
  const { spaceName, name, labelName, onChange } = props;

  return (
    <>
      {labelName ? (
        <Form.Item noStyle={true} name={labelName} hidden={true}>
          <Input />
        </Form.Item>
      ) : null}
      <Form.Item
        noStyle={true}
        shouldUpdate={(prevValues, curValues) => {
          return spaceName
            ? prevValues[spaceName] !== curValues[spaceName]
            : false;
        }}
      >
        {({ getFieldValue, resetFields, setFieldsValue }) => {
          const spaceValue = spaceName ? getFieldValue(spaceName) : undefined;
          // resetFields(labelName ? [name, labelName] : [name]); // 外部重置
          return (
            <InnerIterationSelect
              {...props}
              spaceValue={spaceValue}
              onValueChange={
                labelName
                  ? (value, option) => {
                      setFieldsValue({
                        [labelName!]: (
                          option as { label: string; value: string }
                        ).label,
                      });
                      onChange?.(value, option);
                    }
                  : onChange
              }
            />
          );
        }}
      </Form.Item>
    </>
  );
};

export { IterationSelect };
