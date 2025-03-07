interface WrapperProps {
  children: React.ReactNode;
  useContainer?: boolean;
}

export default function Wrapper({
  children,
  useContainer = true,
}: WrapperProps) {
  return <div className={useContainer ? "sm:container" : ""}>{children}</div>;
}
