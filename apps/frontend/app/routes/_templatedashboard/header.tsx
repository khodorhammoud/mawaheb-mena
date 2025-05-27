import { useTranslation } from 'react-i18next';
import { navigation } from '~/constants/navigation';
import { NavLink, useMatches } from '@remix-run/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import '~/styles/wavy/wavy.css';
import { Link, useNavigate } from '@remix-run/react';
import AppFormField from '~/common/form-fields';
import { BsSearch, BsBell, BsPersonCircle, BsClockHistory } from 'react-icons/bs';
import { Dialog, DialogContent } from '~/components/ui/dialog';
import Availability from '~/common/profileView/availability-form/availability';
// import { AccountStatus, AccountType, NotificationType } from '@mawaheb/db/enums';
import { AccountStatus, AccountType, NotificationType } from '@mawaheb/db/enums';
import { useToast } from '~/components/hooks/use-toast';
import { NotificationBell } from '~/components/notifications/NotificationBell';

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  severity: string;
  createdAt: string;
  readAt: string | null;
  payload?: Record<string, any>;
}

interface ProcessedNotification extends Omit<Notification, 'createdAt' | 'readAt'> {
  createdAt: Date;
  readAt: Date | null;
}

export default function Header() {
  const { t } = useTranslation();
  const menuNavigation = navigation(t);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Use useMatches to get parent route data
  const matches = useMatches();

  // Use the correct route ID with 'routes/' prefix
  const dashboardRoute = matches.find(match => match.id === 'routes/_templatedashboard');
  const routeData = dashboardRoute?.data || {};

  // Extract data with defaults to prevent errors - use type assertion to fix TS errors
  const accountType = (routeData as any).accountType || null;
  const isOnboarded = Boolean((routeData as any).isOnboarded);
  const notifications = (routeData as any).notifications || [];
  const accountStatus = (routeData as any).accountStatus || null;

  // Process notifications without using map
  const processedNotifications: ProcessedNotification[] = [];
  if (notifications && notifications.length > 0) {
    for (const notification of notifications) {
      processedNotifications.push({
        ...notification,
        createdAt: new Date(notification.createdAt),
        readAt: notification.readAt ? new Date(notification.readAt) : null,
      });
    }

    // Sort notifications by date - newest first
    processedNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Function to open the dialog
  const openDialog = () => {
    setIsDialogOpen(true);
  };

  // Function to handle the "Post Job" button click
  const handlePostJobClick = e => {
    // Check if account is deactivated - compare as string to be safe
    if (accountStatus && accountStatus.toString() === AccountStatus.Deactivated.toString()) {
      e.preventDefault();

      toast({
        variant: 'destructive',
        title: 'Action Not Allowed',
        description: "You can't create a new job while your account is deactivated",
      });

      return false;
    }
  };

  const handleNotificationClick = (notificationId: number) => {
    // Use the new /notification/:id URL pattern which is separate from the notifications list
    window.location.href = `/notification/${notificationId}`;
  };

  return (
    <header className="font-['Switzer-Regular'] bg-white border-b border-gray-300 pb-1 pt-1 fixed top-0 left-0 w-full z-30">
      <div className="grid lg:grid-cols-[2fr,1fr] grid-cols-[9fr,4fr] md:gap-8 gap-2 items-center justify-around py-4">
        <div className="flex items-center">
          {/* Title */}
          <div className="xl:text-2xl lg:text-lg md:text-base text-sm font-extrabold font-['BespokeSerif-Regular'] xl:mr-20 lg:mr-14 xl:ml-10 lg:ml-8 ml-4 md:mr-10 sm:mr-4 mr-2 whitespace-nowrap">
            {t('siteTitle')}
          </div>

          {/* Search */}
          <div className="sm:w-[40%] w-full">
            {/* <AppFormField
              id="email"
              name="email"
              label={
                <div className="flex items-center justify-center">
                  <BsSearch /> <div className="md:block ml-4 hidden">Hinted search text</div>
                </div>
              }
            /> */}
          </div>
        </div>

        <div className="flex items-center lg:gap-6 gap-2 justify-end md:mr-10 sm:ml-2 sm:mr-4 mr-2">
          {/* Conditionally render the "Post Job" button */}
          {accountType !== AccountType.Freelancer && location.pathname !== '/new-job' && (
            <Link
              to="/new-job"
              onClick={handlePostJobClick}
              className="bg-primaryColor rounded-xl md:text-base text-sm text-white xl:px-6 py-2 px-4 gradient-box not-active-gradient w-fit whitespace-nowrap"
            >
              Post Job
            </Link>
          )}

          {/* Icons rendered, if NOT Onboarded */}
          {isOnboarded && (
            <div className="flex lg:gap-6 gap-1">
              {/* 🔔 */}
              <NotificationBell
                notifications={processedNotifications}
                onNotificationClick={handleNotificationClick}
              />

              {/* Freelancer Icon :) */}
              {accountType === AccountType.Freelancer && (
                // 🕛
                <BsClockHistory
                  className="sm:h-9 sm:w-9 h-8 w-8 text-gray-600 hover:bg-[#E4E3E6] transition-all hover:rounded-full p-2 cursor-pointer"
                  onClick={openDialog}
                />
              )}
              {/* 🧑‍🏫 */}
              <BsPersonCircle className="sm:h-9 sm:w-9 h-8 w-8 text-gray-600 hover:bg-[#E4E3E6] transition-all hover:rounded-full p-2" />
            </div>
          )}
        </div>
      </div>

      {/* Dialog for Availability Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white rounded-xl max-w-xl w-full p-8 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Availability />
        </DialogContent>
      </Dialog>

      {/* Mobile Menu - Framer Motion */}
      <motion.nav
        initial={{ height: 0 }}
        animate={{ height: isOpen ? 'auto' : 0 }}
        className="overflow-hidden md:hidden backdrop-blur-md"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 1 : 0 }}
          className="flex flex-col space-y-2 px-4 py-2"
        >
          {menuNavigation.map(navItem => (
            <NavLink
              key={navItem.label}
              to={navItem.href}
              className={({ isActive }) =>
                clsx(
                  'inline-block w-max px-6 py-2 rounded transition-colors duration-300',
                  {
                    'text-white bg-primaryColor': isActive,
                    'text-primaryColor bg-white': !isActive,
                  },
                  'not-active-gradient gradient-box hover:text-white hover:bg-primaryColor'
                )
              }
              onClick={() => setIsOpen(false)}
            >
              {navItem.label}
            </NavLink>
          ))}
        </motion.div>
      </motion.nav>
    </header>
  );
}
