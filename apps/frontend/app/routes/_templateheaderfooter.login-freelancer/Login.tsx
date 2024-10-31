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
      <div className="flex h-screen mt-20 mb-44">
        {/* Left Side - Login Form */}
        <div className="md:w-1/2 bg-white flex flex-col justify-center items-center p-8 w-[60%] ml-10 mt-24">
          <LoginFormComponent />
        </div>

        {/* Right Side - Image and Testimonial */}
        <div className="hidden md:block bg-gray-50 relative w-[40%]">
          <RegistrationSlider slides={slides} />
        </div>
      </div>
    </LayoutContainer>
  );
}
