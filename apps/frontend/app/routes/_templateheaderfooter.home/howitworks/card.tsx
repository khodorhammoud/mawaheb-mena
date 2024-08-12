// we used that for how it works
// FeatureCard inside it the normal Card

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
// the upper interface is an onject, and it seams that it is named an interface and not type as regular since i need to use that object in the weird functional component FeatureCard

const FeatureCard: FC<CardProps> = ({ step, title, description, imageUrl }) => {
  // that is a weird functional component called FeatureCard that we'll found inside it the card component that we took from components \ ui folder :)
  return (
    <Card className="relative bg-white rounded-[10px] shadow-lg p-4 h-[530px] w-[400px] font-['Switzer-Regular'] border-2 border-slate-200">
      <CardHeader className="p-0 mb-4">
        <div className="text-base text-gray-500">{step}</div>
        <CardTitle className="text-3xl font-light pt-6">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-slate-800 text-base -m-4 pt-8 pb-8">
          {description}
        </CardDescription>
      </CardContent>
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-48 object-cover rounded-lg mb-4"
      />
    </Card>
  );
};

export default FeatureCard;
