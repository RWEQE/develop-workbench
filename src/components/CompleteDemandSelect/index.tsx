import React, { useMemo } from 'react';
import { Row, Col, Form } from '@middle/ui';
import { TeamSpaceSelect } from '@/components/TeamSpaceSelect';
import { IterationSelect } from '@/components/IterationSelect';
import { TaskSelect } from '@/components/TaskSelect';
import styless from './index.less';

const CompleteDemandSelect: React.FC<any> = ({
  form,
}) => {

  return useMemo(() => {
    return (
      <div>
        <br />
        <p className={styless.requiredLabel}>关联星云需求</p>
        <Row gutter={24}>
          <Col span={8}>
            <TeamSpaceSelect
              name="teamSpaceId"
              appearance="edit"
              placeholder="选择空间"
              labelName="teamSpaceName"
              allowClear={false}
              onChange={() => {
                form.setFieldsValue({
                  iterationId: undefined,
                  taskId: undefined,
                });
              }}
            />
          </Col>
          <Col span={8}>
            <Form.Item
              noStyle
              shouldUpdate={(pre, next) => pre.teamSpaceId !== next.teamSpaceId}
            >
              {({getFieldValue}) => {
                const teamSpaceId = getFieldValue('teamSpaceId');
                return (
                  <IterationSelect
                    name="iterationId"
                    appearance="edit"
                    spaceName="teamSpaceId"
                    placeholder="选择迭代"
                    labelName="iterationName"
                    disabled={teamSpaceId === undefined}
                    allowClear={false}
                    onChange={() => {
                      form.setFieldsValue({
                        taskId: undefined,
                      });
                    }}
                  />
                )
              }}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              noStyle
              shouldUpdate={(pre, next) => pre.teamSpaceId !== next.teamSpaceId}
            >
              {({getFieldValue}) => {
                const iterationId = getFieldValue('iterationId');
                return (
                  <TaskSelect
                    name="taskId"
                    appearance="edit"
                    disabled={iterationId === undefined}
                    iterationName="iterationId"
                    placeholder="选择需求/任务"
                    required="请先选择需求/任务"
                  />
                )
              }}
            </Form.Item>
          </Col>
        </Row>
      </div>
    )
  }, [])
}

export { CompleteDemandSelect };