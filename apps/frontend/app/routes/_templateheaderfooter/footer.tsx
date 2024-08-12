// if this was an index.tsx, use rfc to create a react functional component
// if this was an index.tsx, use rcc to create a react class component

import React from "react";

// export default function footer() {
// 	return (
// 		<div>footer</div>
// 	)
// }

// I guess this should be Footer() :)
export default function Layout() {
  return (
    <footer className="bg-white text-black py-10 border-t border-gray-300">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between">
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h4 className="text-xl font-semibold mb-4">Join our newsletter</h4>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md"
              />
              <button className="bg-black text-white px-6 py-2 rounded-r-md">
                Subscribe
              </button>
            </div>
            <p className="text-gray-500 text-sm mt-2">
              By subscribing you agree to with our{" "}
              <a href="#" className="underline">
                Privacy Policy
              </a>
            </p>
          </div>
          <div className="w-full md:w-2/3 flex flex-wrap">
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <h4 className="text-lg font-semibold mb-4">Solutions</h4>
              <ul className="text-sm">
                <li className="mb-2">
                  <a href="#" className="hover:text-gray-700">
                    1 + Freelancers
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:text-gray-700">
                    Delivery Teams
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:text-gray-700">
                    Permanent Employees
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:text-gray-700">
                    AI Developers
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:text-gray-700">
                    Technical Scoping
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:text-gray-700">
                    Kodeless
                  </a>
                </li>
              </ul>
            </div>
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <h4 className="text-lg font-semibold mb-4">Ecosystem</h4>
              <ul className="text-sm">
                <li className="mb-2">
                  <a href="#" className="hover:text-gray-700">
                    Studios
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:text-gray-700">
                    Agencies
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:text-gray-700">
                    Fellows
                  </a>
                </li>
              </ul>
            </div>
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="text-sm">
                <li className="mb-2">
                  <a href="#" className="hover:text-gray-700">
                    How It Works
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:text-gray-700">
                    Why MAWAHEB
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:text-gray-700">
                    Our Vetting
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:text-gray-700">
                    vs. Employees
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:text-gray-700">
                    vs. Agencies
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:text-gray-700">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <h4 className="text-lg font-semibold mb-4">For Freelancers</h4>
              <ul className="text-sm">
                <li className="mb-2">
                  <a href="#" className="hover:text-gray-700">
                    Benefits
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:text-gray-700">
                    How It Works
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:text-gray-700">
                    How To Join
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:text-gray-700">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="text-sm">
                <li className="mb-2">
                  <a href="#" className="hover:text-gray-700">
                    About Us
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:text-gray-700">
                    Press
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:text-gray-700">
                    Why We Do This
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:text-gray-700">
                    Our Partners
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:text-gray-700">
                    Who We Are
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="hover:text-gray-700">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-300 pt-6 text-sm text-gray-500 flex justify-between items-center">
          <span>© 2024 Mawaheb. All rights reserved.</span>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-gray-700">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gray-700">
              Terms of Service
            </a>
            <a href="#" className="hover:text-gray-700">
              Cookies Settings
            </a>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-gray-700">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="hover:text-gray-700">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="hover:text-gray-700">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="hover:text-gray-700">
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a href="#" className="hover:text-gray-700">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
