import React from "react";

export default function Layout() {
  return (
    <footer className="bg-white text-black py-10 border-t border-gray-200">
      <div className="container mx-auto px-4">
        {/* First Row: Newsletter Signup */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <h4 className="text-2xl font-semibold">Join our newsletter</h4>
          <div className="ml-[11%] col-span-2">
            <div className="flex w-full">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none transition duration-200"
                style={{ borderColor: "#D3D3D3", borderRadius: "10px" }}
              />
              <button
                className="px-6 py-2 text-primaryColor border border-gray-300 hover:bg-primaryColor hover:text-white transition duration-300"
                style={{
                  color: "#yourPrimaryColor", // Replace with your primary color
                  borderColor: "#D3D3D3",
                  borderRadius: "10px",
                }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Second Row: Subscription Agreement */}
        <div className="mt-4 flex justify-end pr-32">
          <p className="text-gray-600 text-sm">
            By subscribing you agree to our{" "}
            <a href="#" className="underline hover:text-gray-800">
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Third Row: Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mt-8">
          <div>
            <h4 className="text-xl font-semibold mb-4">Solutions</h4>
            <ul className="text-md space-y-2">
              <li>
                <a href="#" className="hover:text-gray-700">
                  1+ Freelancers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-700">
                  Delivery Teams
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-700">
                  Permanent Employees
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-700">
                  AI Developers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-700">
                  Technical Scoping
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-700">
                  Kodeless
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-4">Ecosystem</h4>
            <ul className="text-md space-y-2">
              <li>
                <a href="#" className="hover:text-gray-700">
                  Studios
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-700">
                  Agencies
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-700">
                  Fellows
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-4">Product</h4>
            <ul className="text-md space-y-2">
              <li>
                <a href="#" className="hover:text-gray-700">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-700">
                  Why MAWAHEB
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-700">
                  Our Vetting
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-700">
                  vs. Employees
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-700">
                  vs. Agencies
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-700">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-4">For Freelancers</h4>
            <ul className="text-md space-y-2">
              <li>
                <a href="#" className="hover:text-gray-700">
                  Benefits
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-700">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-700">
                  How To Join
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-700">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-4">Company</h4>
            <ul className="text-md space-y-2">
              <li>
                <a href="#" className="hover:text-gray-700">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-700">
                  Press
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-700">
                  Why We Do This
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-700">
                  Our Partners
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-700">
                  Who We Are
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-700">
                  Careers
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Fourth Row: Footer Bottom Section */}
        <div className="text-md mt-8 border-t border-gray-200 pt-6 text-gray-700 flex flex-col md:flex-row justify-between items-center">
          <span>© 2024 Mawaheb. All rights reserved.</span>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-900">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gray-900">
              Terms of Service
            </a>
            <a href="#" className="hover:text-gray-900">
              Cookies Settings
            </a>
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-900">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="hover:text-gray-900">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="hover:text-gray-900">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="hover:text-gray-900">
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a href="#" className="hover:text-gray-900">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
