import { sidebarEmployerNav, sidebarFreelancerNav } from '~/constants/navigation';
import { useTranslation } from 'react-i18next';
import { NavLink, useLoaderData } from '@remix-run/react';
import clsx from 'clsx';
import { AccountType } from '~/types/enums';
import { FaUser } from 'react-icons/fa6';

export default function Sidebar() {
  const { accountType, profile } = useLoaderData<{
    accountType: string;
    profile;
  }>();
  const { t } = useTranslation();
  // const location = useLocation(); // Get the current location
  let menuNavigation;
  switch (accountType) {
    case AccountType.Freelancer:
      menuNavigation = sidebarFreelancerNav(t, profile?.account?.accountStatus);
      break;
    case AccountType.Employer:
    default:
      menuNavigation = sidebarEmployerNav(t);
      break;
  }

  return (
    <div className="md:w-64 w-36 h-full bg-white py-5 lg:px-2 mt-20">
      <div className="fixed">
        <div className="flex flex-col xl:ml-7 ml-5">
          {/* User Badge */}
          <div className="bg-gray-300 rounded-full w-20 h-20 flex items-center justify-center mb-2">
            {/* Display uploaded icon, initials, or fallback user icon */}
            {profile?.account?.user?.uploadedIcon ? (
              <img
                src={profile.account.user.uploadedIcon}
                alt="User Icon"
                className="rounded-full w-full h-full"
              />
            ) : profile?.account?.user?.firstName && profile?.account?.user?.lastName ? (
              <span className="text-xl font-bold">
                {profile.account.user.firstName.charAt(0).toUpperCase()}
                {profile.account.user.lastName.charAt(0).toUpperCase()}
              </span>
            ) : (
              <FaUser className="text-gray-500 md:text-4xl text-3xl" />
            )}
          </div>

          {/* name */}
          <div className="flex flex-col gap-1 border-b border-gray-400 pb-8">
            {/* Display the full name */}
            <h2 className="text-lg font-medium">
              {profile?.account?.user?.firstName}{' '}
              {profile?.account?.user?.lastName.charAt(0).toUpperCase()}.
            </h2>
            <p className="text-sm text-gray-500">{profile?.account?.location}</p>
            <p className="text-sm text-gray-500">{profile?.account?.websiteURL}</p>
          </div>
        </div>

        <nav className="mt-8">
          {menuNavigation.map(navItem => (
            <NavLink
              key={navItem.label}
              to={navItem.href}
              className={({ isActive }) =>
                clsx(
                  'flex items-center mb-2 xl:px-4 px-2 md:py-2 py-1 rounded-xl md:text-base text-sm transition-all group hover:translate-x-2 hover:text-primaryColor', // Container styles
                  {
                    '': !isActive, // Hover background for inactive items
                  }
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Icon Container with its own hover style */}
                  <div
                    className={clsx(
                      'mr-2 md:py-2 py-2 md:px-4 px-3 rounded-xl transition-colors', // Icon container styling
                      {
                        'bg-blue-100 text-primaryColor translate-x-2': isActive, // Active icon background and text color
                        'text-gray-600 group-hover:bg-primaryColor group-hover:text-white':
                          !isActive, // Hover styles for inactive icon
                      }
                    )}
                  >
                    <navItem.icon className="text-xl" />
                  </div>

                  {/* Label with its own hover style */}
                  <span
                    className={clsx(
                      'transition-colors', // Smooth transition for text
                      {
                        'text-primaryColor translate-x-2': isActive, // Active text styles
                        'text-gray-700 group-hover:text-primaryColor': !isActive, // Hover styles for inactive text
                      }
                    )}
                  >
                    {navItem.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
