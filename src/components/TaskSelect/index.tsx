import React, { useState, useEffect, CSSProperties } from 'react';
import { Form, Select, Input, SelectProps } from '@middle/ui';
import { queryTask } from '@/services/code-check';
import globalStyle from '@/styles/global.less';
import { Tooltip } from 'antd';

interface ITask {
  id: number;
  name: string;
}

interface TaskSelectProp {
  name: string | Array<string | number>;
  label?: string;
  required?: string;
  appearance?: 'default' | 'edit'; // default | edit
  mode?: 'multiple' | 'tags';
  disabled?: boolean;
  allowClear?: boolean;
  placeholder?: string;
  iterationValue?: number;
  iterationName?: string | Array<string | number>;
  labelName?: string;
  formItemStyle?: CSSProperties; // Form.Item 的样式
  onChange?: (value: number, option: { label: string; value: number }) => void;
  onSelect?: (value: number, option: { label: string; value: number }) => void;
  onDeselect?: (value: number) => void;
}

interface TaskInnerSelectProp extends Omit<TaskSelectProp, 'labelName'> {}

const TaskInnerSelect: React.FC<TaskInnerSelectProp> = ({
  name,
  label,
  required,
  appearance,
  mode,
  disabled,
  allowClear = true,
  placeholder,
  iterationValue,
  formItemStyle,
  onChange,
  onSelect,
  onDeselect,
}) => {
  const [tasks, setTasks] = useState<undefined | Array<{ label: string; value: number }>>(
    undefined,
  );

  useEffect(() => {
    if (iterationValue) {
      loadTasksByIterationId();
    }
  }, [iterationValue]);

  const loadTasksByIterationId = () => {
    queryTask(iterationValue!).then(({ code, data }) => {
      if (code === 200000) {
        const list = data.map(({ id, name, demandName }: any) => ({
          label: (
            <div>
              <div>{demandName}</div>
              <div style={{ color: 'rgb(191, 191, 191)', fontSize: 12 }}>{name}</div>
            </div>
          ),
          taskName: `${demandName}-${name}`,
          value: id,
        }));
        setTasks(list);
      }
    });
  };

  return (
    <Form.Item
      name={name}
      label={label}
      style={formItemStyle}
      rules={required ? [{ required: true, message: required }] : undefined}
    >
      <Select
        options={tasks}
        className={appearance == 'edit' ? globalStyle.editInput : ''}
        showSearch
        optionFilterProp="children"
        mode={mode || undefined}
        loading={tasks === void 0}
        disabled={disabled || false}
        allowClear={allowClear}
        placeholder={placeholder}
        maxTagCount={'responsive'}
        getPopupContainer={(triggerNode) => triggerNode.parentElement}
        onChange={onChange as SelectProps<any>['onChange']}
        onSelect={onSelect as SelectProps<any>['onSelect']}
        onDeselect={onDeselect as SelectProps<any>['onDeselect']}
        filterOption={(input: string, option: any) =>
          JSON.stringify(option).toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      />
    </Form.Item>
  );
};

const TaskSelect: React.FC<TaskSelectProp> = (props) => {
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
            <TaskInnerSelect
              {...props}
              iterationValue={currentIterationValue}
              onSelect={
                labelName
                  ? (value, option) => {
                      setFieldsValue({
                        [labelName!]: (option as { label: string; value: number; }).label,
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

export { TaskSelect };
