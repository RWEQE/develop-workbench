import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { UnControlled } from 'react-codemirror2';
import 'codemirror/addon/display/autorefresh';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/properties/properties';
import 'codemirror/mode/textile/textile';
import 'codemirror/mode/yaml/yaml';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/markdown/markdown';

interface PropsType {
  value: string;
  setValue?: Dispatch<SetStateAction<string>>;
  mode?: string;
  theme?: string;
  readOnly?: boolean;
  height?: number | string;
  refresh?: number;
}

const ModeMap: Record<string, string> = {
  properties: 'text/x-properties',
  txt: 'text/x-textile',
  yml: 'text/x-yaml',
  yaml: 'text/x-yaml',
  json: 'application/json',
  xml: 'application/xml',
  markdown: 'markdown',
};

const CodeMirror: React.FC<PropsType> = ({
  value,
  setValue,
  mode = 'txt',
  theme,
  readOnly = false,
  height,
  refresh,
}) => {
  const [codeMirror, setCodeMirror] = useState<any>(null);

  useEffect(() => {
    if (codeMirror) {
      setTimeout(() => {
        codeMirror.refresh();
      }, 1);
    }
  }, [codeMirror, value, refresh]);

  return (
    <UnControlled
      value={value}
      options={{
        mode: ModeMap[mode],
        theme: theme || mode == 'markdown' ? 'default' : 'material',
        lineNumbers: mode !== 'markdown', // 是否显示行号
        readOnly, // 是否只读
        styleActiveLine: true,
        lineWiseCopyCut: true,
        // lineWrapping: true,
        autoRefresh: true,
        placeholder: 'placeholder可以吗',
      }}
      // 设置尺寸
      editorDidMount={(editor) => {
        editor.setSize('100%', height || 'auto');
        setCodeMirror(editor);
      }}
      onChange={(editor: any, data: any, value: string) => {
        setValue && setValue(value);
      }}
    />
  );
};

export default CodeMirror;
