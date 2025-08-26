type Props = { title: string; primary: string; secondary: string };

export default function Stat({ title, primary, secondary }: Props) {
  return (
    <div className="p-4 border-l first:border-l-0">
      <div className="text-xs uppercase text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{primary}</div>
      <div className="text-xs text-gray-400">{secondary}</div>
    </div>
  );
}
