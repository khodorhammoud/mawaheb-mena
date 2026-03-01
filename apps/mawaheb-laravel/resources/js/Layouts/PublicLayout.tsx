import { Link, usePage } from '@inertiajs/react';
import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { PageProps } from '@/types';

const navigation = [
    { label: 'For Employers', href: '/for-employers' },
    { label: 'For Freelancers', href: '/for-freelancers' },
    { label: 'About Us', href: '/about-us' },
    { label: 'Contact Us', href: '/contact-us' },
];

const actionNav = [
    { label: 'Hire Now', href: '/signup-employer' },
    { label: 'Join Our Team', href: '/signup-freelancer' },
];

function Header() {
    const { url, props } = usePage<PageProps>();
    const [isOpen, setIsOpen] = useState(false);
    const auth = (props as any).auth;

    return (
        <header className="bg-white border-b border-gray-300 pb-2 pt-2 fixed top-0 left-0 w-full z-[1000]">
            <div className="container flex lg:gap-24 md:gap-8 gap-2 items-center py-4">
                <Link href="/" className="xl:text-2xl lg:text-lg md:text-base font-extrabold">
                    MAWAHEB MENA
                </Link>

                <nav className="hidden md:flex xl:space-x-4 space-x-2 md:text-sm xl:text-base">
                    {navigation.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={clsx(
                                'rounded-xl px-1 md:px-2 lg:px-4 py-1 xl:px-6 xl:py-2 transition-colors',
                                url.startsWith(item.href)
                                    ? 'bg-[#27638a] text-white'
                                    : 'text-[#27638a] hover:bg-[#27638a] hover:text-white'
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Burger menu for mobile */}
                <div className="md:hidden ml-auto">
                    <motion.button
                        onClick={() => setIsOpen(!isOpen)}
                        className="focus:outline-none"
                        animate={{ rotate: isOpen ? -90 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isOpen ? (
                            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-[#27638a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        )}
                    </motion.button>
                </div>

                <nav className="hidden md:flex xl:space-x-4 space-x-2 md:text-sm xl:text-base ml-auto">
                    {auth?.user ? (
                        <Link
                            href="/dashboard"
                            className="text-white bg-[#27638a] rounded-xl px-1 md:px-2 lg:px-4 py-1 xl:px-6 xl:py-2 hover:opacity-90 transition"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        actionNav.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="text-white bg-[#27638a] rounded-xl px-1 md:px-2 lg:px-4 py-1 xl:px-6 xl:py-2 hover:opacity-90 transition"
                            >
                                {item.label}
                            </Link>
                        ))
                    )}
                </nav>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.nav
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden md:hidden"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                    >
                        <div className="flex flex-col space-y-2 px-4 py-2">
                            {[...navigation, ...actionNav].map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={clsx(
                                        'inline-block w-max px-6 py-2 rounded transition-colors',
                                        url.startsWith(item.href)
                                            ? 'text-white bg-[#27638a]'
                                            : 'text-[#27638a] bg-white hover:bg-[#27638a] hover:text-white'
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    );
}

function Footer() {
    return (
        <footer className="bg-white text-black py-10 border-t border-gray-200">
            <div className="container mx-auto px-4">
                {/* Newsletter */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <h4 className="text-2xl font-semibold">Join our newsletter</h4>
                    <div className="lg:ml-[11%] col-span-2">
                        <div className="flex w-full gap-4">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 border border-gray-300 rounded-[10px] px-4 py-2.5 focus:outline-none focus:border-[#27638a]"
                            />
                            <button className="px-6 rounded-[10px] text-[#27638a] border border-gray-300 hover:bg-[#27638a] hover:text-white transition duration-300">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex justify-end pr-32">
                    <p className="text-gray-600 text-sm">
                        By subscribing you agree to our{' '}
                        <a href="#" className="underline hover:text-gray-800">Privacy Policy</a>
                    </p>
                </div>

                {/* Footer Links */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mt-8">
                    <div>
                        <h4 className="text-xl font-semibold mb-4">Solutions</h4>
                        <ul className="text-md space-y-2">
                            {['1+ Freelancers', 'Delivery Teams', 'Permanent Employees', 'AI Developers', 'Technical Scoping', 'Kodeless'].map((item) => (
                                <li key={item}><a href="#" className="hover:text-gray-700">{item}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xl font-semibold mb-4">Ecosystem</h4>
                        <ul className="text-md space-y-2">
                            {['Studios', 'Agencies', 'Fellows'].map((item) => (
                                <li key={item}><a href="#" className="hover:text-gray-700">{item}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xl font-semibold mb-4">Product</h4>
                        <ul className="text-md space-y-2">
                            {['How It Works', 'Why MAWAHEB', 'Our Vetting', 'vs. Employees', 'vs. Agencies', 'FAQ'].map((item) => (
                                <li key={item}><a href="#" className="hover:text-gray-700">{item}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xl font-semibold mb-4">For Freelancers</h4>
                        <ul className="text-md space-y-2">
                            {['Benefits', 'How It Works', 'How To Join', 'FAQ'].map((item) => (
                                <li key={item}><a href="#" className="hover:text-gray-700">{item}</a></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xl font-semibold mb-4">Company</h4>
                        <ul className="text-md space-y-2">
                            {['About Us', 'Press', 'Why We Do This', 'Our Partners', 'Who We Are', 'Careers'].map((item) => (
                                <li key={item}><a href="#" className="hover:text-gray-700">{item}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="text-md mt-8 border-t border-gray-200 pt-6 text-gray-700 flex flex-col md:flex-row justify-between items-center">
                    <span>&copy; 2024 Mawaheb. All rights reserved.</span>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <a href="#" className="hover:text-gray-900">Privacy Policy</a>
                        <a href="#" className="hover:text-gray-900">Terms of Service</a>
                        <a href="#" className="hover:text-gray-900">Cookies Settings</a>
                    </div>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        {['facebook-f', 'twitter', 'instagram', 'linkedin-in', 'youtube'].map((icon) => (
                            <a key={icon} href="#" className="hover:text-gray-900">
                                <i className={`fab fa-${icon}`} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default function PublicLayout({ children }: { children: ReactNode }) {
    return (
        <div>
            <Header />
            {children}
            <Footer />
        </div>
    );
}
