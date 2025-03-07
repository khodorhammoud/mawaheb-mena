import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
}
// <LayoutContainer>
const LayoutContainer = ({ children }: ContainerProps) => {
  return <div className="">{children}</div>;
};

export default LayoutContainer;
