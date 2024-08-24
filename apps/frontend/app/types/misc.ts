export type registrationSlideData = {
  image: string;
  quote: string;
  name: string;
  title: string;
  rating: number;
};

export type SuccessVerificationLoaderStatus = {
  success: boolean;
  error?: boolean;
  message?: string;
};
