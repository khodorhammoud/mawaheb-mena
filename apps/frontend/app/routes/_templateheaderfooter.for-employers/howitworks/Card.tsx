import { FC } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../../components/ui/card";

interface CardProps {
  step: string;
  title: string;
  description: string;
  imageUrl: string;
  className?: string; // Make className optional
}

const FeatureCard: FC<CardProps> = ({
  step,
  title,
  description,
  imageUrl,
  className,
}) => {
  return (
    <Card
      className={`relative bg-white rounded-[10px] shadow-lg p-4 h-[530px] w-[400px] font-['Switzer-Regular'] border-2 border-slate-200 ${className}`}
    >
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
