import { FC } from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "~/components/ui/card";

interface CardProps {
	step: string;
	title: string;
	description: string;
	imageUrl: string;
}

const FeatureCard: FC<CardProps> = ({ step, title, description, imageUrl }) => {
	return (
		<Card className="relative bg-white rounded-lg shadow-lg p-4">
			<CardHeader className="p-0 mb-4">
				<div className="text-sm text-gray-500">{step}</div>
				<CardTitle className="text-xl font-bold">{title}</CardTitle>
			</CardHeader>
			<img
				src={imageUrl}
				alt={title}
				className="w-full h-48 object-cover rounded-lg mb-4"
			/>
			<CardContent>
				<CardDescription className="text-gray-700">
					{description}
				</CardDescription>
			</CardContent>
		</Card>
	);
};

export default FeatureCard;
