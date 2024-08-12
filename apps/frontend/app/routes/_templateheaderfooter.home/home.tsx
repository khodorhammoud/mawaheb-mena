import HeroSection from "./herosection/herosection";
import LayoutContainer from "../../common/layout_container";
import FeaturesSection from "./featuressection/featuressection";
import HowItWorks from "./howitworks/howitworks";
import MainHeading from "~/common/main_heading";
import FAQ from "./faq";
import { Button } from "~/components/ui/button";
import { useNavigate } from "@remix-run/react";
import "~/styles/wavy/wavy.css";

// To know more, press crtl + click on component you what to know about

export default function Home() {
  const navigate = useNavigate();
  return (
    <LayoutContainer>
      {/* this is still gloomy, but it represents the navigation  */}

      <HeroSection />
      {/* this represents the herosection file inside herosection folder ( the name of employers and so on ... )*/}

      <FeaturesSection />
      {/* this is the features i have in the website ( 1- Ai 2- Software Solutions 3- ..... ) */}

      <HowItWorks />
      {/* this is the How it works section, that has 4 steps first, and the big header, besides the list of the coding languages, and ends by the what they say about us section that has  */}

      {/* Here, there should be a Header component that acrries (SEGMENTS THAT WE ARE HAPPY OF WORK), and as List component let's say that carries the list of the coding languages, and ends with a Testimonials component by the what they say about us section that has */}

      <MainHeading
        title="WHY WORK WITH US?"
        description="At Mawaheb we understand the complexities involved in hiring freelancers. That's why we've streamlined the process to make it as effortless as possible for our clients. From handling all regulatory and legal obligations to ensuring compliance with industry standards, we take care of every detail so you can focus on your business goals. Trust us to navigate the intricacies of hiring, allowing you to enjoy a hassle-free experience from start to finish."
      />
      {/* this is a MaiHeading that has a props inside it 💖, and it represents the (WHY WORK WITH US) section */}

      <FAQ />
      {/* this is the FAQ component that uses Card Component that is in the component \ ui folder in the common folder 💖 */}

      <div className="text-left my-[60px]">
        <h1 className="text-4xl font-['Switzer-Regular']">
          Still have a question?
        </h1>
        <Button onClick={() => navigate("/contact")} className="mt-4">
          Contact Us
        </Button>
        {/* the above button takes us to /contact when clicked, and that file isn't made yet :) */}
      </div>
      {/* this should be in a component in an another folder and shall be called here as the other components */}
    </LayoutContainer>
    // I've just noticed that this Component has a closing tag 👍
  );
}
