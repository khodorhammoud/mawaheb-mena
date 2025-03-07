import RegistrationSlider, {
  registrationSlideData,
} from "../../common/registration/registrationSlider";
import LayoutContainer from "../../common/layout_container";
import SignupFormComponent from "./SignupFormComponent";

const slides: registrationSlideData[] = [
  {
    image:
      "https://img.freepik.com/premium-photo/young-adult-arabian-sales-agent-formal-attire-holding-laptop-slightly-smiling-modern_868783-106989.jpg?semt=ais_hybrid", // Replace with actual image URL
    quote:
      "Working with Mawaheb MENA has been a game-changer for our company. The platform provided us with access to a pool of highly skilled freelancers who delivered exceptional results on every job. From web development to graphic design, we found top-tier talent for all our needs.",
    name: "Ahmad Ramal",
    title: "CEO, Waxy",
    rating: 2,
  },
  {
    image:
      "https://img.freepik.com/premium-photo/young-adult-arabian-sales-agent-formal-attire-holding-laptop-slightly-smiling-modern_868783-106989.jpg?semt=ais_hybrid", // Replace with actual image URL
    quote:
      "The platform not only provided me with access to a wide range of exciting jobs but also supported me every step of the way.",
    name: "Layla Mourad",
    title: "JavaScript Expert",
    rating: 3,
  },
];

export default function SignUpFreelancerPage() {
  return (
    <LayoutContainer>
      <div className="flex w-full mt-20 mb-36 max-w-screen-2xl mx-auto">
        {/* Left Side - Login Form */}
        <div className="w-1/2 bg-white flex flex-col justify-center items-center">
          <SignupFormComponent />
        </div>

        {/* Right Side - Image and Testimonial */}
        <div className="w-1/2 bg-gray-50 flex flex-col justify-center relative">
          {/* Chadcn Carousel Slider */}
          <div className="relative overflow-hidden h-full w-full flex items-center">
            <RegistrationSlider slides={slides} />
          </div>
        </div>
      </div>
    </LayoutContainer>
  );
}
