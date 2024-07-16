import type { Schema, Attribute } from '@strapi/strapi';

export interface BlockFaqCard extends Schema.Component {
  collectionName: 'components_block_faq_cards';
  info: {
    displayName: 'FAQ card';
  };
  attributes: {
    question: Attribute.String;
    answer: Attribute.Text;
  };
}

export interface BlockFeaturedFreelancerCard extends Schema.Component {
  collectionName: 'components_block_featured_freelancer_cards';
  info: {
    displayName: 'Featured freelancer card';
  };
  attributes: {
    freelancerName: Attribute.String;
    freelancerTitle: Attribute.String;
    salary: Attribute.String;
    experiences: Attribute.JSON;
  };
}

export interface BlockFeaturesCard extends Schema.Component {
  collectionName: 'components_block_features_cards';
  info: {
    displayName: 'featuresCard';
    description: '';
  };
  attributes: {
    title: Attribute.String;
    description: Attribute.Text;
    icon: Attribute.Media<'images'>;
  };
}

export interface BlockHeroSection extends Schema.Component {
  collectionName: 'components_block_hero_sections';
  info: {
    displayName: 'Hero Section';
  };
  attributes: {
    Title: Attribute.String;
    Body: Attribute.Text;
    Image: Attribute.Media<'images'>;
  };
}

export interface BlockHowItWorksCard extends Schema.Component {
  collectionName: 'components_block_how_it_works_cards';
  info: {
    displayName: 'How it works card';
  };
  attributes: {
    title: Attribute.String;
    description: Attribute.Text;
    image: Attribute.Media<'images'>;
    step: Attribute.String;
  };
}

export interface BlockTestimonial extends Schema.Component {
  collectionName: 'components_block_testimonials';
  info: {
    displayName: 'Testimonial';
  };
  attributes: {
    logo: Attribute.Media<'images'>;
    content: Attribute.Text;
    testifierName: Attribute.String;
    testifierPosition: Attribute.String;
    testifierImage: Attribute.Media<'images'>;
  };
}

export interface BlockTextBlock extends Schema.Component {
  collectionName: 'components_block_text_blocks';
  info: {
    displayName: 'Text block';
  };
  attributes: {
    title: Attribute.String;
    content: Attribute.Text;
    subtitle: Attribute.String;
  };
}

export interface BlockTrademark extends Schema.Component {
  collectionName: 'components_block_trademarks';
  info: {
    displayName: 'Trademark';
  };
  attributes: {
    text: Attribute.String;
  };
}

export interface BlogBlog extends Schema.Component {
  collectionName: 'components_blog_blogs';
  info: {
    displayName: 'Blog';
    description: '';
  };
  attributes: {
    title: Attribute.String;
    subtitle: Attribute.String;
    author: Attribute.String;
    content: Attribute.Text;
    excerpt: Attribute.Text;
    image: Attribute.Media<'images'>;
    timeToRead: Attribute.String;
  };
}

export interface EmployerHomeBlogCards extends Schema.Component {
  collectionName: 'components_employer_home_blog_cards';
  info: {
    displayName: 'Blog cards';
  };
  attributes: {
    cards: Attribute.Component<'blog.blog', true>;
  };
}

export interface EmployerHomeFaQs extends Schema.Component {
  collectionName: 'components_employer_home_fa_qs';
  info: {
    displayName: 'FAQs';
  };
  attributes: {
    faqs: Attribute.Component<'block.faq-card', true>;
  };
}

export interface EmployerHomeFeaturedSlider extends Schema.Component {
  collectionName: 'components_employer_home_featured_sliders';
  info: {
    displayName: 'Featured slider';
  };
  attributes: {
    cards: Attribute.Component<'block.featured-freelancer-card', true>;
  };
}

export interface EmployerHomeFeatures extends Schema.Component {
  collectionName: 'components_employer_home_features';
  info: {
    displayName: 'Features';
  };
  attributes: {
    card: Attribute.Component<'block.features-card', true>;
  };
}

export interface EmployerHomeHowItWorks extends Schema.Component {
  collectionName: 'components_employer_home_how_it_works';
  info: {
    displayName: 'How it works';
  };
  attributes: {
    cards: Attribute.Component<'block.how-it-works-card', true>;
  };
}

export interface EmployerHomeTestimonials extends Schema.Component {
  collectionName: 'components_employer_home_testimonials';
  info: {
    displayName: 'Testimonials';
  };
  attributes: {
    testimonials: Attribute.Component<'block.testimonial', true>;
  };
}

export interface LinksSocial extends Schema.Component {
  collectionName: 'components_links_socials';
  info: {
    displayName: 'Social';
  };
  attributes: {
    Name: Attribute.String;
    link: Attribute.String;
    Media: Attribute.Enumeration<
      ['Facebook', 'X', 'Linkedin', 'Instagram', 'Youtube']
    >;
  };
}

export interface SeoMetadata extends Schema.Component {
  collectionName: 'components_seo_metadata';
  info: {
    displayName: 'Metadata';
  };
  attributes: {
    metaTitle: Attribute.String;
    metaDescription: Attribute.Text;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'block.faq-card': BlockFaqCard;
      'block.featured-freelancer-card': BlockFeaturedFreelancerCard;
      'block.features-card': BlockFeaturesCard;
      'block.hero-section': BlockHeroSection;
      'block.how-it-works-card': BlockHowItWorksCard;
      'block.testimonial': BlockTestimonial;
      'block.text-block': BlockTextBlock;
      'block.trademark': BlockTrademark;
      'blog.blog': BlogBlog;
      'employer-home.blog-cards': EmployerHomeBlogCards;
      'employer-home.fa-qs': EmployerHomeFaQs;
      'employer-home.featured-slider': EmployerHomeFeaturedSlider;
      'employer-home.features': EmployerHomeFeatures;
      'employer-home.how-it-works': EmployerHomeHowItWorks;
      'employer-home.testimonials': EmployerHomeTestimonials;
      'links.social': LinksSocial;
      'seo.metadata': SeoMetadata;
    }
  }
}
