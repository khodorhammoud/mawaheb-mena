import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";

const faqs = [
	{
		id: 1,
		question: "How does your AI matching tool work?",
		answer:
			"Our AI matching tool analyzes project requirements, freelancer skills, and past performance data to identify the most suitable match for your project. It uses advanced algorithms to ensure precise and efficient matchmaking, saving you time and effort in finding the right freelancer.",
	},
	{
		id: 2,
		question: "What industries do your freelancers specialize in?",
		answer:
			"Our freelancers specialize in a wide range of industries including tech, design, writing, marketing, and more.",
	},
	{
		id: 3,
		question: "How do you ensure the quality of freelancers on your platform?",
		answer:
			"We have a rigorous vetting process that includes reviewing portfolios, conducting interviews, and verifying skills and experience to ensure that we provide top-quality freelancers.",
	},
	{
		id: 4,
		question: "What if I'm not satisfied with the freelancer's work?",
		answer:
			"If you're not satisfied with a freelancer's work, we offer a satisfaction guarantee and will work with you to find a suitable resolution, which may include reworking the project or matching you with a different freelancer.",
	},
	{
		id: 5,
		question: "What are your pricing and payment policies?",
		answer:
			"Our pricing is competitive and transparent. Payments are handled securely through our platform, and we offer various payment options to suit your needs.",
	},
];

const FAQ = () => {
	const [openFAQ, setOpenFAQ] = useState<number | null>(1);

	const toggleFAQ = (id: number) => {
		setOpenFAQ(openFAQ === id ? null : id);
	};

	return (
		<section className="py-16 bg-gray-100">
			<div className="container mx-auto px-4">
				<h2 className="text-3xl font-bold mb-8">FAQS</h2>
				<div className="space-y-4">
					{faqs.map((faq) => (
						<Card key={faq.id} className="bg-white shadow-lg rounded-lg">
							<CardHeader
								className="flex justify-between items-center p-4 cursor-pointer"
								onClick={() => toggleFAQ(faq.id)}
							>
								<div className="flex items-center">
									<span className="text-xl font-bold text-green-600 mr-2">
										{faq.id < 10 ? `0${faq.id}` : faq.id}
									</span>
									<CardTitle className="text-lg font-medium">
										{faq.question}
									</CardTitle>
								</div>
								{openFAQ === faq.id ? (
									<ChevronUpIcon className="w-6 h-6 text-gray-600" />
								) : (
									<ChevronDownIcon className="w-6 h-6 text-gray-600" />
								)}
							</CardHeader>
							{openFAQ === faq.id && (
								<CardContent className="p-4 border-t border-gray-200">
									<p className="text-gray-700">{faq.answer}</p>
								</CardContent>
							)}
						</Card>
					))}
				</div>
			</div>
		</section>
	);
};

export default FAQ;
