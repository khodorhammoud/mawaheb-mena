import MainHeading from "~/common/main_heading";
import FeatureCard from "./card";
import { Form, useLoaderData } from "@remix-run/react";

const features = [
	{
		step: "Step 01",
		title: "Get in Touch",
		description:
			"Start by reaching out to our team to begin the process. Whether you have a clear vision or need guidance, we're here to assist you every step of the way.",
		imageUrl:
			"https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
	},
	{
		step: "Step 02",
		title: "Define Your Vision",
		description:
			"Let's delve into the specifics of your jobs. Share your objectives, requirements, and any preferences you have regarding the skill set or experience of the freelancer you're looking for.",
		imageUrl:
			"https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
	},
	{
		step: "Step 03",
		title: "AI-Powered Matchmaking",
		description:
			"Our cutting-edge AI matching tool will analyze your job details and match you with the most suitable freelancer from our talented pool. With precision and efficiency, we ensure you're paired with the perfect match.",
		imageUrl:
			"https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
	},
	{
		step: "Step 04",
		title: "Unlock Success",
		description:
			"Once the match is made, you're on your way to success. Leverage the expertise of your matched freelancer as they bring your jobs to life. From development to delivery, we're dedicated to ensuring your satisfaction and the success of your jobs.",
		imageUrl:
			"https://www.fivebranches.edu/wp-content/uploads/2021/08/default-image.jpg",
	},
];

export default function FeaturesSection() {
	return (
		<section className="py-16 bg-gray-100">
			<MainHeading title="HOW IT WORKS" />

			<div className="container mx-auto px-4">
				<div className="relative">
					<div className="absolute w-full h-full flex flex-col items-center justify-between">
						{/* Connecting Lines */}
						<div className="h-1/6 w-px bg-gray-300"></div>
						<div className="w-2/5 h-px bg-gray-300"></div>
						<div className="h-1/6 w-px bg-gray-300"></div>
						<div className="w-2/5 h-px bg-gray-300"></div>
						<div className="h-1/6 w-px bg-gray-300"></div>
						<div className="w-2/5 h-px bg-gray-300"></div>
						<div className="h-1/6 w-px bg-gray-300"></div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
						{features.map((feature, index) => (
							<div key={index} className="relative">
								<FeatureCard
									step={feature.step}
									title={feature.title}
									description={feature.description}
									imageUrl={feature.imageUrl}
								/>
								{index % 2 === 0 && (
									<div className="absolute top-1/2 left-full transform translate-y-1/2 w-8 h-px bg-gray-300"></div>
								)}
								{index % 2 !== 0 && (
									<div className="absolute top-1/2 right-full transform translate-y-1/2 w-8 h-px bg-gray-300"></div>
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
