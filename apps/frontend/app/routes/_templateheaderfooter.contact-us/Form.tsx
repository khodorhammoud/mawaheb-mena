import { useLoaderData } from '@remix-run/react'; // Hook to retrieve the loader data

interface ContactUsForm {
  title: string;
  subHeadline: {
    content: string;
  };
}

const Form = () => {
  // Get the data from the loader using the useLoaderData hook
  const { contactUsFormSection } = useLoaderData<{
    contactUsFormSection: ContactUsForm[];
  }>();
  const form = contactUsFormSection[0]; // Access the first form section

  return (
    <div className="font-['Switzer-Regular'] grid grid-cols-1 md:grid-cols-2 items-center justify-center gap-20 my-40">
      <div className="">
        <p className="text-6xl font-['BespokeSerif-Regular'] font-bold leading-relaxed">
          {form?.title || "Have a question or need assistance? We're here to help! Reach out to us"}
        </p>
        <p className="text-xl font-['BespokeSerif-Regular'] mt-40 mb-6">
          {form?.subHeadline?.content ||
            "Whether you have questions about our platform, need technical support, or want to provide feedback, we're here to ensure you have a seamless experience with Mawaheb MENA."}
        </p>
      </div>

      <div className="flex justify-center items-center">
        <form className="p-8 w-full">
          <div className="relative mb-14">
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder=" "
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0 focus:ring-primaryColor focus:border-primaryColor placeholder:text-slate-600 peer transition-all hover:border-black"
            />
            <label
              htmlFor="fullName"
              className="absolute text-slate-600 left-4 -top-4 bg-white px-1 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-600 peer-placeholder-shown:top-4 peer-focus:-top-3 peer-focus:text-primaryColor peer-focus:text-sm"
            >
              Full Name
            </label>
          </div>

          <div className="relative mb-14">
            <input
              type="email"
              id="email"
              name="email"
              placeholder=" "
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0 focus:ring-primaryColor focus:border-primaryColor placeholder:text-slate-600 peer transition-all hover:border-black"
            />
            <label
              htmlFor="email"
              className="absolute text-slate-600 left-4 -top-4 bg-white px-1 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-600 peer-placeholder-shown:top-4 peer-focus:-top-3 peer-focus:text-primaryColor peer-focus:text-sm"
            >
              Email Address
            </label>
          </div>

          <div className="relative mb-4">
            <textarea
              id="message"
              name="message"
              placeholder=" "
              required
              className="w-full h-[300px] px-4 py-3 border border-gray-300 rounded-xl focus:outline-none
    focus-visible:ring-0
    focus-visible:outline-none
    focus:ring-0
    focus:border-none
    focus-visible:border-none
    focus-visible:ring-offset-0 focus:ring-primaryColor focus:border-primaryColor resize-none placeholder:text-slate-600 peer transition-all hover:border-black"
            ></textarea>
            <label
              htmlFor="message"
              className="absolute text-slate-600 left-4 -top-4 bg-white px-1 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-600 peer-placeholder-shown:top-4 peer-focus:-top-3 peer-focus:text-primaryColor peer-focus:text-sm"
            >
              Message
            </label>
          </div>

          <div>
            <button
              type="submit"
              className="bg-primaryColor text-white py-2 px-5 rounded-xl not-active-gradient gradient-box"
            >
              Send Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form;
