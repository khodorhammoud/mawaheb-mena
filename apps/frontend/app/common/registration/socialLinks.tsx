import { useLocation } from "@remix-run/react";
import GoogleAuthButton from "../auth/GoogleAuthButton";
import { AccountType } from "~/types/enums";

export default function SocialLinks() {
  const location = useLocation();

  // Determine the mode and account type based on the current route
  const isLogin = location.pathname.includes("login");
  const isEmployer = location.pathname.includes("employer");

  const mode = isLogin ? "login" : "signup";
  const accountType = isEmployer
    ? AccountType.Employer
    : AccountType.Freelancer;

  return (
    <div className="mt-6 w-full grid grid-cols-1 gap-3">
      <div className="w-full">
        <GoogleAuthButton mode={mode} accountType={accountType} />
      </div>
      <div className="w-full">
        {/* Continue with LinkedIn */}
        <a
          href="/"
          className="flex w-full items-center justify-center py-3 text-lg font-semibold text-primaryColor bg-white border border-gray-300 not-active-gradient rounded-xl hover:text-white hover:bg-primaryColor"
        >
          <span className="sr-only">Continue with LinkedIn</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2"
            width="1em"
            height="1em"
            viewBox="0 0 256 256"
          >
            <path
              fill="#0a66c2"
              d="M218.123 218.127h-37.931v-59.403c0-14.165-.253-32.4-19.728-32.4c-19.756 0-22.779 15.434-22.779 31.369v60.43h-37.93V95.967h36.413v16.694h.51a39.91 39.91 0 0 1 35.928-19.733c38.445 0 45.533 25.288 45.533 58.186zM56.955 79.27c-12.157.002-22.014-9.852-22.016-22.009s9.851-22.014 22.008-22.016c12.157-.003 22.014 9.851 22.016 22.008A22.013 22.013 0 0 1 56.955 79.27m18.966 138.858H37.95V95.967h37.97zM237.033.018H18.89C8.58-.098.125 8.161-.001 18.471v219.053c.122 10.315 8.576 18.582 18.89 18.474h218.144c10.336.128 18.823-8.139 18.966-18.474V18.454c-.147-10.33-8.635-18.588-18.966-18.453"
            />
          </svg>
          <span>Continue with LinkedIn</span>
        </a>
      </div>
      <div className="w-full">
        {/* Continue with Microsoft */}
        <a
          href="/"
          className="flex w-full items-center justify-center py-3 text-lg font-semibold text-primaryColor bg-white border border-gray-300 not-active-gradient rounded-xl hover:text-white hover:bg-primaryColor"
        >
          <span className="sr-only">Continue with Microsoft</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2"
            width="1em"
            height="1em"
            viewBox="0 0 256 256"
          >
            <path fill="#f1511b" d="M121.666 121.666H0V0h121.666z" />
            <path fill="#80cc28" d="M256 121.666H134.335V0H256z" />
            <path fill="#00adef" d="M121.663 256.002H0V134.336h121.663z" />
            <path fill="#fbbc09" d="M256 256.002H134.335V134.336H256z" />
          </svg>
          <span>Continue with Microsoft</span>
        </a>
      </div>
    </div>
  );
}
