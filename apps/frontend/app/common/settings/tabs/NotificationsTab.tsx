import ToggleSwitch from '~/common/toggle-switch/ToggleSwitch';

export default function NotificationsTab() {
  return (
    <div className="p-6">
      <div className="grid lg:grid-cols-[15%_80%] lg:justify-center gap-8 xl:gap-10 lg:gap-12 mt-4">
        <div className="text-lg font-semibold" data-testid="notifications-title">
          Notifications
        </div>
        <div className="flex flex-col gap-8 text-base mt-1" data-testid="notifications-section">
          {/* Notification 1 */}
          <div className="grid grid-cols-[90%_10%] gap-6 items-center xl:mr-12 lg:mr-6 md:mr-4 sm:mr-0 -mr-3">
            <div
              className="font-semibold col-span-2 text-right"
              data-testid="notifications-email-header"
            >
              Email
            </div>
          </div>
          <div className="grid grid-cols-[90%_10%] gap-6 items-center sm:text-base text-sm">
            <div>New jobs match your interested jobs</div>
            <ToggleSwitch
              isChecked={true}
              onChange={state => console.log('Toggle1 is now:', state)}
              className="self-start mt-1"
              data-testid="notification-toggle-1"
            />
          </div>
          {/* Notification 2 */}
          <div className="grid grid-cols-[90%_10%] gap-6 items-center sm:text-base text-sm">
            <div>You have been invited to a job</div>
            <ToggleSwitch
              isChecked={true}
              onChange={state => console.log('Toggle2 is now:', state)}
              className="self-start mt-1"
              data-testid="notification-toggle-2"
            />
          </div>
          {/* Notification 3 */}
          <div className="grid grid-cols-[90%_10%] gap-6 items-center sm:text-base text-sm">
            <div>You have been declined from a job</div>
            <ToggleSwitch
              isChecked={true}
              onChange={state => console.log('Toggle3 is now:', state)}
              className="self-start mt-1"
              data-testid="notification-toggle-3"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
