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

// To know more, press crtl + click on component you what to know about

export default function Home() {
  return (
    <LayoutContainer>
      {/* this is still gloomy, but it represents the navigation  */}

      <HeroSection />
      {/* this represents the herosection file inside herosection folder ( the name of employers and so on ... )*/}
      <FeaturesSection />
      {/* this is the features i have in the website ( 1- Ai 2- Software Solutions 3- ..... ) */}

      <HowItWorks />
      {/* this is the How it works section, that has 4 steps first, and the big header, besides the list of the coding languages, and ends by the what they say about us section that has  */}

      {/* Here, there should be a Header component that carries (SEGMENTS THAT WE ARE HAPPY OF WORK), and a List component let's say that carries the list of the coding languages, and ends with a Testimonials component by the what they say about us section that has */}
      <Segments />
      <Languages />

      <WhyWorkWithUs />
      {/* this is a MainHeading that has a props inside it 💖, and it represents the (WHY WORK WITH US) section */}

      <FAQ />
      {/* this is the FAQ component that uses Card Component that is in the component \ ui folder in the common folder 💖 */}

      <ContactUs />
      {/* this should be in a component in another folder and shall be called here as the other components */}

      <BlogCardsList />
    </LayoutContainer>
    // I've just noticed that this Component has a closing tag 👍
  );
}
