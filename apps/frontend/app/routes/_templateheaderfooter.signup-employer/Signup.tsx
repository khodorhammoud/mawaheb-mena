import LayoutContainer from "../../common/layout_container";

import RegistrationSlider, {
  registrationSlideData,
} from "../../common/registration/registrationSlider";
import SignupFormComponent from "./SignupFormComponent";

export default function SignUpEmployerPage() {
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

  return (
    <LayoutContainer>
      <div className="flex">
        {/* Left Side - Sign Up Form */}
        <div className="md:w-1/2 flex flex-col items-center p-8 mt-14 w-[60%] ml-10">
          <SignupFormComponent />
        </div>

        {/* Right Side - Image and Testimonial Slider */}
        <div className="hidden md:block relative w-[40%] mt-20">
          <RegistrationSlider slides={slides} />
        </div>
      </div>
    </LayoutContainer>
  );
}
