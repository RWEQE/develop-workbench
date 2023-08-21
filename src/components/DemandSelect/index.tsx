import React, { useState, useEffect } from 'react';
import { Form, Select, Input, SelectProps } from '@middle/ui';
import { request } from '@/utils/request';
import globalStyle from '@/styles/global.less';

interface IDemand {
  id: number;
  name: string;
}

interface DemandSelectProp {
  name: string;
  label?: string;
  required?: string;
  appearance?: 'default' | 'edit'; // default | edit
  mode?: 'multiple' | 'tags';
  disabled?: boolean;
  placeholder?: string;
  iterationValue?: number;
  iterationName?: string;
  labelName?: string;
  onChange?: (value: number, option: { label: string; value: number }) => void;
  onSelect?: (value: number, option: { label: string; value: number }) => void;
  onDeselect?: (value: number) => void;
}

interface DemandInnerSelectProp extends Omit<DemandSelectProp, 'labelName'> {}

const DemandInnerSelect: React.FC<DemandInnerSelectProp> = ({
  name,
  label,
  required,
  appearance,
  mode,
  disabled,
  placeholder,
  iterationValue,
  onChange,
  onSelect,
  onDeselect,
}) => {
  const [demands, setDemands] = useState<
    undefined | Array<{ label: string; value: number }>
  >(undefined);

  useEffect(() => {
    if (iterationValue) {
      loadDemandsByIterationId();
    }
  }, [iterationValue]);

  const loadDemandsByIterationId = () => {
    request(
      '/api/openapi/v1/code/openapi-DMS-queryDemandByIteration/type/list',
      {
        method: 'post',
        data: {
          iterationId: iterationValue,
        },
      },
    ).then(({ data }) => {
      setDemands(
        data.map((item: IDemand) => {
          return {
            label: item.name,
            value: item.id,
          };
        }),
      );
    });
  };

  return (
    <Form.Item
      name={name}
      label={label}
      rules={required ? [{ required: true, message: required }] : undefined}
    >
      <Select
        options={demands}
        className={appearance == 'edit' ? globalStyle.editInput : ''}
        showSearch
        optionFilterProp="children"
        mode={mode || undefined}
        loading={demands === void 0}
        disabled={disabled || false}
        placeholder={placeholder}
        maxTagCount={'responsive'}
        getPopupContainer={(triggerNode) => triggerNode.parentElement}
        onChange={onChange as SelectProps<any>['onChange']}
        onSelect={onSelect as SelectProps<any>['onSelect']}
        onDeselect={onDeselect as SelectProps<any>['onDeselect']}
        filterOption={(input: string, option: any) =>
          JSON.stringify(option)
            .toLowerCase()
            .indexOf(input.toLowerCase()) >= 0
        }
      />
    </Form.Item>
  );
};

const DemandSelect: React.FC<DemandSelectProp> = (props) => {
  const { name, iterationValue, iterationName, labelName, onSelect } = props;
  return (
    <>
      {labelName ? (
        <Form.Item noStyle={true} name={labelName} hidden={true}>
          <Input />
        </Form.Item>
      ) : null}
      <Form.Item
        noStyle={true}
        shouldUpdate={(pre, next) =>
          iterationName ? pre[iterationName] != next[iterationName] : false
        }
      >
        {({ getFieldValue, resetFields, setFieldsValue }) => {
          const currentIterationValue = iterationName
            ? getFieldValue(iterationName)
            : iterationValue;
          // resetFields(labelName ? [name, labelName] : [name]); // 外部重置
          return (
            <DemandInnerSelect
              {...props}
              iterationValue={currentIterationValue}
              onSelect={
                labelName
                  ? (value, option) => {
                      setFieldsValue({
                        [labelName!]: (
                          option as { label: string; value: number }
                        ).label,
                      });
                      onSelect && onSelect(value, option);
                    }
                  : onSelect
              }
            />
          );
        }}
      </Form.Item>
    </>
  );
};

export { DemandSelect };
