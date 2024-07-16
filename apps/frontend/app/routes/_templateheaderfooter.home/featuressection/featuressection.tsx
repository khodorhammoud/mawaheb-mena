import React from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "~/components/ui/card";

const features = [
	{
		title: "Tailored Software Solutions",
		description:
			"Harness the expertise of top-notch freelancers proficient in a wide array of skills to craft outstanding digital products tailored to your needs. Our curated talent pool includes specialists in front-end and back-end development, design, content creation.",
		icon: "path_to_icon_1", // replace with actual icon path
	},
	{
		title: "Expert Freelancer Matching",
		description:
			"Let us assist you in finding exceptional freelancers who can deliver outstanding results for your next big idea. Our platform connects you with top talent, ensuring your projects are completed with the highest level of quality and professionalism.",
		icon: "path_to_icon_2", // replace with actual icon path
	},
	{
		title: "AI-Powered Matchmaking",
		description:
			"Utilize our AI matching system to connect with the perfect freelancers who possess the precise skills to bring your vision to life. Experience seamless project execution with talent tailored to your specific needs, ensuring exceptional quality and results.",
		icon: "path_to_icon_3", // replace with actual icon path
	},
	{
		title: "Comprehensive Crew Formation",
		description:
			"Build your complete crew of talented freelancers with us, ensuring every aspect of your jobs is handled perfectly. From project initiation to final delivery, our experts will manage every detail, providing you with exceptional quality and seamless execution.",
		icon: "path_to_icon_4", // replace with actual icon path
	},
];

export default function FeaturesSection() {
	return (
		<section className="py-16 my-[50px] bg-gradient-to-b from-white to-blue-200">
			<div className="container mx-auto px-4">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{features.map((feature, index) => (
						<Card key={index} className="bg-white rounded-lg shadow-lg">
							<CardHeader className="flex items-center justify-center p-4">
								<img
									src={feature.icon}
									alt={feature.title}
									className="w-10 h-10"
								/>
							</CardHeader>
							<CardContent className="p-4">
								<CardTitle className="text-xl font-bold">
									{feature.title}
								</CardTitle>
								<CardDescription className="text-gray-700 mt-2">
									{feature.description}
								</CardDescription>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
