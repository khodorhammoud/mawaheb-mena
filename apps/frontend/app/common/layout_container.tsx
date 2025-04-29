import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
}
// <LayoutContainer>
const LayoutContainer = ({ children }: ContainerProps) => {
  return <div className="container">{children}</div>;
};

export default LayoutContainer;
