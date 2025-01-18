import RegistrationSlider, {
  registrationSlideData,
} from "../../common/registration/registrationSlider";
import LayoutContainer from "../../common/layout_container";
import LoginFormComponent from "./LoginFormComponent";

export default function LoginFreelancerPage() {
  const slides: registrationSlideData[] = [
    {
      image: "https://via.placeholder.com/300", // Replace with actual image URL
      quote:
        "Working with Mawaheb MENA has been an incredible experience. The platform not only provided me with access to a wide range of exciting jobs but also supported me every step of the way.",
      name: "Layla Mourad",
      title: "Javascript Expert",
      rating: 2,
    },
    {
      image: "https://via.placeholder.com/300", // Replace with actual image URL
      quote:
        "Working with Mawaheb MENA has been an incredible experience. The platform not only provided me with access to a wide range of exciting jobs but also supported me every step of the way.",
      name: "Layla Mourad",
      title: "JavaScript Expert",
      rating: 3,
    },
  ];

  return (
    <LayoutContainer>
      <div className="flex w-full mt-20 mb-36 max-w-screen-2xl mx-auto">
        {/* Left Side - Login Form */}
        <div className="w-1/2 bg-white flex flex-col justify-center items-center">
          <LoginFormComponent />
        </div>

        {/* Right Side - Image and Testimonial */}
        <div className="w-1/2 bg-gray-50 flex flex-col justify-center relative">
          <div className="relative overflow-hidden h-full w-full flex items-center">
            <RegistrationSlider slides={slides} />
          </div>
        </div>
      </div>
    </LayoutContainer>
  );
}
