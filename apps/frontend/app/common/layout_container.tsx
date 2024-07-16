// components/Container.jsx
import { ReactNode } from "react";

interface ContainerProps {
	children: ReactNode;
}

const LayoutContainer = ({ children }: ContainerProps) => {
	return <div className="container mx-auto px-4">{children}</div>;
};

export default LayoutContainer;
