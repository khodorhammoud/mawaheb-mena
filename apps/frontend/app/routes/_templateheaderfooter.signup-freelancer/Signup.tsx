import RegistrationSlider, {
  registrationSlideData,
} from "../../common/registration/registrationSlider";
import LayoutContainer from "../../common/layout_container";
import SignupFormComponent from "./SignupFormComponent";

const slides: registrationSlideData[] = [
  {
    image: "https://via.placeholder.com/300", // Replace with actual image URL
    quote:
      "Working with Mawaheb MENA has been a game-changer for our company. The platform provided us with access to a pool of highly skilled freelancers who delivered exceptional results on every job. From web development to graphic design, we found top-tier talent for all our needs.",
    name: "Ahmad Ramal",
    title: "CEO, Waxy",
    rating: 2,
  },
  {
    image: "https://via.placeholder.com/300", // Replace with actual image URL
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
      <div className="flex h-screen">
        {/* Left Side - Login Form */}
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-8">
          <SignupFormComponent />
        </div>

        {/* Right Side - Image and Testimonial */}
        <div className="hidden md:block w-1/2 bg-gray-50 relative">
          <RegistrationSlider slides={slides} />
        </div>
      </div>
    </LayoutContainer>
  );
}
