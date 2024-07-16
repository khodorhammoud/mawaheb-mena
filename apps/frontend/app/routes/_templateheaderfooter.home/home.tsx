import HeroSection from "./herosection/herosection";
import LayoutContainer from "../../common/layout_container";
import FeaturesSection from "./featuressection/featuressection";
import HowItWorks from "./howitworks/howitworks";
import MainHeading from "~/common/main_heading";
import FAQ from "./faq";
import { Button } from "~/components/ui/button";
import { useNavigate } from "@remix-run/react";

export default function Home() {
	const navigate = useNavigate();
	return (
		<LayoutContainer>
			<HeroSection />
			<FeaturesSection />
			<HowItWorks />
			<MainHeading
				title="WHY WORK WITH US?"
				description="At Mawaheb we understand the complexities involved in hiring freelancers. That's why we've streamlined the process to make it as effortless as possible for our clients. From handling all regulatory and legal obligations to ensuring compliance with industry standards, we take care of every detail so you can focus on your business goals. Trust us to navigate the intricacies of hiring, allowing you to enjoy a hassle-free experience from start to finish."
			/>
			<FAQ />
			<div className="text-left my-[60px]">
				<h1 className="text-4xl font-['Switzer-Regular']">
					Still have a question?
				</h1>
				<Button onClick={() => navigate("/contact")} className="mt-4">
					Contact Us
				</Button>
			</div>
		</LayoutContainer>
	);
}
