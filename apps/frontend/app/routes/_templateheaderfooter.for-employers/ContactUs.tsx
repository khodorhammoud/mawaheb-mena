import { Button } from "../../components/ui/button";
import { Link } from "@remix-run/react";
const ContactUs = () => {
  // Assume isActive is always true for demonstration purposes
  // Replace this with your actual condition or state management
  // const isActive = false;

  return (
    <div className="text-left mt-4 mb-16 ml-4">
      <h1 className="text-4xl font-['Switzer-Regular']">
        Still have a question?
      </h1>
      <Button className="text-primaryColor bg-white text-[18px] my-4 px-6 py-2 border border-primaryColor rounded-[10px] z-0 hover:bg-primaryColor gradient-box hover:text-white hover:rounded-[10px] not-active-gradient">
        <Link to="/contact">Contact Us</Link>
      </Button>
      {/* the above button takes us to /contact when clicked, and that file isn't made yet :) */}
    </div>
  );
};

export default ContactUs;
