'use client';

import * as React from 'react';
import { useToast } from '~/components/hooks/use-toast';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '~/components/ui/toast';

// Add a hook to check if we're hydrated on the client
function useHydrated() {
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

export function Toaster() {
  const { toasts } = useToast();
  const isHydrated = useHydrated();

  // Don't render anything until we're on the client
  if (!isHydrated) {
    return null;
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
