import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Drawer, Row, Col, Button, Alert, Form, Input, Radio, Space, message } from '@middle/ui';
import { Table } from 'antd';
import { DeleteOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { BarTitle } from '@/components/BarTitle';
import { queryGlobalVariable, createGlobalVariable, updateGlobalVariable } from '@/services/develp-workbench';
import { IApplicaitonList, IImmutableVariable, IDynamicVariable } from '@/interfaces/develop-workbench';
import styless from './index.less';

interface CiVariableProp  {
  visible: boolean;
  appInfo: IApplicaitonList;
  onCancel: () => void;
}

const CiVariable: React.FC<CiVariableProp> = ({
  visible,
  appInfo,
  onCancel,
}) => {

  const [ciVariableId, setCiVariableId] = useState<number>(); // 是创建还是修改
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if(visible && appInfo) {
      form.setFieldsValue(appInfo)
      loadGlobalVariable();
    }
  }, [visible, appInfo])

  // 查询已有全局变量
  const loadGlobalVariable = useCallback(() => {
    setLoading(true)
    queryGlobalVariable(appInfo.projectId, appInfo.id).then(
      (res) => {
        setVariableData('immutableVariableList' , JSON.parse(res.immutableVariables));
        setVariableData('dynamicVariableList' , JSON.parse(res.dynamicVariables));
        res?.id && setCiVariableId(res.id);
      }
    ).then(
      () => setLoading(false)
    )
  }, [appInfo])

  // 把 获取到的 动态/静态 变量 放到组件里
  const setVariableData = useCallback(
    (formName: 'immutableVariableList' | 'dynamicVariableList', content: Object) => {
      const newContent = []
      for (const [key, value] of Object.entries(content || {})) {
        if(formName == 'dynamicVariableList') {
          newContent.push({ 
            key, 
            defaultValue: (value as any)?.defaultValue || '',
            values: (value as any)?.values || [],
          })
        } else if(formName == 'immutableVariableList') {
          newContent.push({ key, value })
        }
      }
      form.setFieldsValue({
        [formName]: newContent,
      })
    }, []
  )

  // 增加一条自定义变量
  const onAddVariable = useCallback(
    (formName: 'immutableVariableList' | 'dynamicVariableList', valueIndex?: number) => {
      const customVariableList = form.getFieldValue(formName) || [];
      const newList = JSON.parse(JSON.stringify(customVariableList))
      if(formName == 'immutableVariableList') {
        newList.push({
          key: '',
          value: ''
        })
      } else if (formName == 'dynamicVariableList' && valueIndex === undefined) {
        newList.push({
          key: '',
          defaultValue: undefined,
          values: ['']
        })
      } else if(formName == 'dynamicVariableList' && valueIndex !== undefined) {
        newList[valueIndex].values.push('')
      }
      form.setFieldsValue({
        [formName]: newList,
      })
    }, []
  )

  // 删除一条自定义变量
  const onDeleteVariable = useCallback(
    (formName: 'immutableVariableList' | 'dynamicVariableList', index: number, valuseIndex?: number) => {
      const oldVariableList = form.getFieldValue(formName) || [];
      const newList = JSON.parse(JSON.stringify(oldVariableList))
      if(formName == 'immutableVariableList') {
        newList.splice(index, 1)
      } else if (formName == 'dynamicVariableList' && newList[index].values.length == 1) {
        newList.splice(index, 1)
      } else {
        newList[index].values.splice(valuseIndex, 1)
      }
      form.setFieldsValue({
        [formName]: newList,
      })
    }, []
  )

  // 选择一条动态 value 为默认值
  const onSelectDefaultValue = useCallback(
    (index, defaultValue) => {
      const oldVariableList = form.getFieldValue('dynamicVariableList') || [];
      const newList = JSON.parse(JSON.stringify(oldVariableList))
      newList[index].defaultValue = defaultValue
      form.setFieldsValue({
        dynamicVariableList: newList,
      })
    }, []
  )

  // 提交
  const onOK = useCallback(() => {
    form.validateFields().then(
      (values) => {
        const { immutableVariableList, dynamicVariableList } = values;
        let noDefaultValue = false
        dynamicVariableList.forEach((variable: IDynamicVariable) => {
          if(!variable.defaultValue || !variable.values.includes(variable.defaultValue)) {
            noDefaultValue = true
          }
        })
        if(noDefaultValue) {
          message.warning('动态变量请先设置默认值！');
          return;
        }
        const immutableVariableObj = {}
        const dynamicVariableObj = {}
        immutableVariableList?.forEach((item: IImmutableVariable) => {
          immutableVariableObj[item.key] = item.value
        })
        dynamicVariableList?.forEach((item: IDynamicVariable) => {
          dynamicVariableObj[item.key] = {
            defaultValue: item.defaultValue,
            values: item.values,
          }
        })
        const submitFunction = ciVariableId ? updateGlobalVariable : createGlobalVariable;
        submitFunction(appInfo.projectId, {
          id: ciVariableId,
          appId: appInfo.id,
          dynamicVariables: JSON.stringify(dynamicVariableObj),
          immutableVariables: JSON.stringify(immutableVariableObj),
        }).then(
          () => {
            message.success(ciVariableId ? '更新成功！' : '创建成功！');
            onCancel();
          }
        )
      }
    )
  }, [ciVariableId, appInfo])

  const handleClose = useCallback(() => {
    form.resetFields();
    setCiVariableId(undefined);
    onCancel();
  }, [])

  return useMemo(() => {
    return (
      <Drawer
        visible={visible}
        title={`持续集成变量"${appInfo?.name}"`}
        width={1080}
        onClose={handleClose}
        footer={(
          <Row justify='space-between'>
            <Button onClick={handleClose}>取消</Button>
            <Button type='primary' onClick={onOK}>提交</Button>
          </Row>
        )}
      >
        <Alert
          message='通过变量runner作用域所有作业中,对当前的project可用,可以使用变量来保存需要区分环境的构建参数或其他内容。'
          type='info'
        />
        <Form form={form} layout='vertical'>
          <BarTitle>
            基本信息
          </BarTitle>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name={'name'}
                label='应用名称'
              >
                <Input
                  appearance='edit'
                  placeholder='这是一个应用名称'
                  readOnly
                />
              </Form.Item>
            </Col>
            <Col span={8} offset={4}>
              <Form.Item
                name={'code'}
                label='应用编码'
              >
                <Input
                  appearance='edit'
                  placeholder='这是一个应用编码'
                  readOnly
                />
              </Form.Item>
            </Col>
          </Row>
          <BarTitle>
            执行变量
          </BarTitle>
          <p><b>
            全局变量(在所有的作业中可以直接使用以下变量)
          </b></p>
          <Form.Item name={'immutableVariableList'} hidden />
          <Form.Item
            noStyle
            shouldUpdate={(pre, next) => pre.immutableVariableList !== next.immutableVariableList}
          >
            {({getFieldValue}) => {
              const immutableVariableList = getFieldValue('immutableVariableList');
              return (
                <Table
                  rowKey={'id'}
                  loading={loading}
                  dataSource={immutableVariableList}
                  columns={[
                    {
                      title: '全局变量的key',
                      dataIndex: 'key',
                      width: '45%',
                      render: (_, record, index ) => (
                        <Form.Item
                          name={['immutableVariableList', index, 'key']}
                          className={styless.marginBottomNull}
                          rules={[{required: true, message: '请输入全局变量的key'}]}
                        >
                          <Input placeholder='请输入全局变量的key' />
                        </Form.Item>
                      )
                    },
                    {
                      title: '全局变量的value',
                      dataIndex: 'value',
                      width: '45%',
                      render: (_, record, index) => (
                        <Form.Item
                          name={['immutableVariableList', index, 'value']}
                          className={styless.marginBottomNull}
                          rules={[{required: true, message: '请输入全局变量的value'}]}
                        >
                          <Input placeholder='请输入全局变量的value' />
                        </Form.Item>
                      )
                    },
                    {
                      title: '操作',
                      dataIndex: 'action',
                      width: '10%',
                      render: (_, record, index) => (
                        <DeleteOutlined 
                          className={styless.clickAbleIcon}
                          onClick={() => onDeleteVariable('immutableVariableList', index)}
                        />
                      )
                    }
                  ]}
                  size={'small'}
                  pagination={false}
                />
              )
            }}
          </Form.Item>
          <Button
            style={{marginTop: 12}}
            type='dashed'
            block
            onClick={() => onAddVariable('immutableVariableList')}
          >
            添加
          </Button>

          <p style={{marginTop: '2rem'}}><b>
            动态变量(动态变量存在多个可选值, 勾选单选框设置为默认, 在作业中手动触发构建时需要指定具体的变量值)
          </b></p>
          <Form.Item name={'dynamicVariableList'} hidden />
          <Form.Item
            noStyle
            shouldUpdate={(pre, next) => pre.dynamicVariableList !== next.dynamicVariableList}
          >
            {({getFieldValue}) => {
              const dynamicVariableList = getFieldValue('dynamicVariableList');
              return (
                <Table
                  rowKey={'id'}
                  loading={loading}
                  dataSource={dynamicVariableList}
                  columns={[
                    {
                      title: '动态变量的key',
                      dataIndex: 'key',
                      width: '45%',
                      render: (_, record, index ) => (
                        <Form.Item
                          name={['dynamicVariableList', index, 'key']}
                          className={styless.marginBottomNull}
                          rules={[{required: true, message: '请输入动态变量的key'}]}
                        >
                          <Input placeholder='请输入动态变量的key' />
                        </Form.Item>
                      )
                    },
                    {
                      title: '动态变量的value',
                      dataIndex: 'values',
                      width: '55%',
                      render: (_, record, index) => (
                        <Space direction='vertical' className={styless.fullWidth}>
                          {
                            record?.values?.map((value: string, ind: number) => {
                              return (
                                <Row 
                                  key={ind}
                                  align='middle'
                                  className={styless.fullWidth}
                                >
                                  <Form.Item
                                    name={['dynamicVariableList', index, 'values', ind]}
                                    className={styless.dynamicVariableValue}
                                    rules={[{required: true, message: '请输入动态变量的value'}]}
                                  >
                                    <Input
                                      placeholder='请输入动态变量的value'
                                      onChange={
                                        record.defaultValue == record.values[ind] ?
                                          (e) => onSelectDefaultValue(index, e.target.value) : 
                                          undefined
                                      }
                                    />
                                  </Form.Item>
                                  <div className={styless.dynamicVariableAction}>
                                    <Radio
                                      checked={record.defaultValue == record.values[ind]}
                                      onChange={() => onSelectDefaultValue(index, record.values[ind])}
                                    />
                                    <Button 
                                      icon={<PlusOutlined />}
                                      type='text' 
                                      onClick={() => onAddVariable('dynamicVariableList', index)}
                                    />
                                    <Button 
                                      icon={<MinusOutlined />} 
                                      type='text' 
                                      onClick={() => onDeleteVariable('dynamicVariableList', index, ind)}
                                    />
                                  </div>
                                </Row>
                              )
                            })
                          }
                        </Space>
                      )
                    },
                  ]}
                  size={'small'}
                  pagination={false}
                />
              )
            }}
          </Form.Item>
          <Button
            style={{marginTop: 12}}
            type='dashed'
            block
            onClick={() => onAddVariable('dynamicVariableList')}
            >
            添加
          </Button>
        </Form>
      </Drawer>
    )
  }, [visible, appInfo, ciVariableId, loading])
}

export { CiVariable };