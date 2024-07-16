export default function MainHeading(props: {
	title: string;
	description?: string;
}) {
	return (
		<div className="text-left my-[60px]">
			<h1 className="text-6xl font-['BespokeSerif-Medium']">{props.title}</h1>
			{props.description && (
				<p className="text-gray-700 mt-2 font-['Switzer-Regular']">
					{props.description}
				</p>
			)}
		</div>
	);
}
