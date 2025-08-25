export default function Header() {
  const Navigation = [
    { title: 'For Employers', url: '/for-employers' },
    { title: 'For Freelancers', url: '/for-freelancers' },
    { title: 'About Us', url: '/about-us' },
    { title: 'Contact Us', url: '/contact-us' },
  ];
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center py-4">
        <div className="text-2xl font-bold">MAWAHEB MENA</div>
        <nav className="flex space-x-4">
          {Navigation.map((nav, index) => (
            <a
              key={index}
              href={nav.url}
              className="text-blue-800 px-4 py-2 rounded hover:bg-blue-50"
            >
              {nav.title}
            </a>
          ))}
          <a href="#" className="text-blue-800 px-4 py-2 rounded hover:bg-blue-50">
            For Employers
          </a>
          <a href="#" className="text-blue-800 px-4 py-2 rounded hover:bg-blue-50">
            For Freelancers
          </a>
          <a href="#" className="text-blue-800 px-4 py-2 rounded hover:bg-blue-50">
            About Us
          </a>
          <a href="#" className="text-blue-800 px-4 py-2 rounded hover:bg-blue-50">
            Contact Us
          </a>
        </nav>
        <a href="#" className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700">
          Hire Now
        </a>
      </div>
    </header>
  );
}
