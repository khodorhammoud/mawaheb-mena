// interface CarouselCardProps {
// 	title: string;

export default function CarouselCard() {
	return (
		<div className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white">
			<img
				className="w-full h-48 object-cover"
				src="https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg"
				alt="Ahmad Khoder"
			/>
			<div className="p-4">
				<h2 className="text-xl font-bold">Ahmad Khoder</h2>
				<p className="text-gray-600">JavaScript Developer</p>
				<p className="mt-2">$20/hour</p>
				<div className="mt-2 flex flex-wrap gap-2">
					<span className="px-2 py-1 bg-gray-200 rounded-full text-sm">
						Responsive design
					</span>
					<span className="px-2 py-1 bg-gray-200 rounded-full text-sm">
						HTML5
					</span>
					<span className="px-2 py-1 bg-gray-200 rounded-full text-sm">
						Node.js
					</span>
					<span className="px-2 py-1 bg-gray-200 rounded-full text-sm">
						Agile
					</span>
					<span className="px-2 py-1 bg-gray-200 rounded-full text-sm">
						Debugging
					</span>
				</div>
			</div>
		</div>
	);
}
