import HeroSection from "./herosection/HeroSection";
import LayoutContainer from "../../common/layout_container";
import FeaturesSection from "./featuressection/FeaturesSection";
import HowItWorks from "./howitworks/HowItWorks";
import FAQ from "./FAQ";
import ContactUs from "./ContactUs";
import "../../styles/wavy/wavy.css";
import Segments from "./Segments";
import Languages from "./Languages";
import BlogCardsList from "./BlogCard";
import WhyWorkWithUs from "./WhyWorkWithUs";
import Wrapper from "~/common/wrapper/Wrapper";

// To know more, press crtl + click on component you what to know about

export default function Home() {
  return (
    <LayoutContainer>
      <Wrapper useContainer={true}>
        <HeroSection />
      </Wrapper>

      <Wrapper useContainer={false}>
        <FeaturesSection />
      </Wrapper>

      <Wrapper useContainer={true}>
        <HowItWorks />
        <Segments />
        <Languages />
        <WhyWorkWithUs />
        <FAQ />
        <ContactUs />
        <BlogCardsList />
      </Wrapper>
    </LayoutContainer>
  );
}
