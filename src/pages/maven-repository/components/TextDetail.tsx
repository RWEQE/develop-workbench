import React, { useState } from 'react';
import { Modal, Input, Typography } from 'antd';
const { Paragraph } = Typography;

interface TextDetailProp {
  value: string;
}

const TextDetail: React.FC<TextDetailProp> = ({value}) => {
  const [visible, setVisible] = useState<boolean>(false);

  return (
    <div style={{display: 'flex'}}>
      <Paragraph
        style={{width: 200, wordBreak: 'break-all', marginBottom: 0}}
        ellipsis={{rows: 1}}
      >
        {value || '-'}
      </Paragraph>
      {
        value && <a onClick={() => setVisible(true)}>查看</a>
      }
      <Modal
        visible={visible}
        title='变更描述'
        footer={false}
        onCancel={() => setVisible(false)}
      >
        <Input.TextArea 
          value={value} 
          autoSize={{minRows: 10}}
          readOnly
        />
      </Modal>
    </div>
  )
}

export { TextDetail };