export interface HowItWorksItem {
  stepNb: number;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface SubHeadline {
  content: string;
}

export interface Feature {
  title: string;
  description: string;
}

export interface PostHowItWorksItem {
  content: string;
}

export interface PreWhatTheySayAboutUs {
  content: string;
}

export interface WhyWorkWithUs {
  title: string;
  description: string;
}

export interface FAQ {
  faqNb: number;
  faqQuestion: string;
  faqAnswer: string;
}

export interface Testimonial {
  iconSVG?: string;
  comment: string;
  imageURL?: string;
  name: string;
  role: string;
}

export interface BlogCard {
  imageURL?: string;
  name?: string;
  readFrom: string;
  content: string;
}

export interface Job {
  id: string;
  jobTitle: string;
  postedFrom: number;
  priceAmout: number;
  priceType: string;
  levelRequired: string;
  jobDesc: string;
  jobSkills: { id: string; name: string };
}

export interface Achievement {
  title: string;
  count: number;
  desc: string;
}

export interface MawahebTopic {
  topic: string;
}

export interface MawahebDescription {
  description: string;
}

export interface Mawaheb {
  mawahebTopics: MawahebTopic[];
  mawahebDescription: MawahebDescription[];
}

export interface ImageSwiper {
  imageURL: string;
}

export interface HowWeMakeDiff {
  id: number;
  title: string;
  description: string;
  iconSVG?: string;
  belongingText: string;
}

export interface TeamMember {
  name: string;
  position: string;
  role: string;
  imageURL: string;
}

export interface MeetTheTeam {
  subHeadline: SubHeadline;
  members: TeamMember[];
}

export interface WantToJoinUs {
  title: string;
  subHeadline: {
    content: string;
  };
  emailbutton: string;
}

export interface ContactUsForm {
  title: string;
  subHeadline: {
    content: string;
  };
}

export interface Location {
  location: string; // e.g., "Dubai"
  area: string; // e.g., "Business Bay"
  contactNumber: string; // e.g., "+054 73049 95"
  email: string; // e.g., "info@mawaheb.mena"
  googleMapsLink: string; // Link to Google Maps location
  localTime: string; // For example, "01:14 PM GMT+4"
  imageUrl: string; // URL for the image displayed (e.g., Burj Khalifa image)
}
