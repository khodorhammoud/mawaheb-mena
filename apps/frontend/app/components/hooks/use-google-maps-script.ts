import { useEffect, useState } from 'react';

declare global {
  interface Window {
    google?: any;
  }
}

export function useGoogleMapsScript(apiKey: string) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.google) {
      setLoaded(true);
      return;
    }

    // Check if script is already in the DOM
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => setLoaded(true));
      return;
    }

    // Create script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.id = 'google-maps-script';
    script.async = true;
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [apiKey]);

  return loaded;
}
