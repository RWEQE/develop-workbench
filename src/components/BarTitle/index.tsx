import { Title } from '@middle/ui';

type BarTitleProps = {
  [key: string]: any;
};

const BarTitle: React.FC<BarTitleProps> = ({ children, ...resetProps }) => {
  return (
    <Title
      style={{ margin: '20px 0' }}
      leftBarSize={4}
      leftBarColor="rgba(49, 103, 252, 1)"
      {...resetProps}
    >
      {children}
    </Title>
  );
};

export { BarTitle };
