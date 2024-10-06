export const GET_FEATURES_QUERY = `
  query {
    features {
      title
      description
    }
  }
`;

export const GET_FOREMPLOYERSSUBHEADLINE_QUERY = `
  query {
    forEmployersSubHeadlines {
      content
    }
  }
`;

export const GET_HOW_IT_WORKS_QUERY = `
    query {
      howItWorksItems {
        stepNb
        title
        description
        imageURL
      }
    }
  `;

export const GET_POSTHOWITWORKS_QUERY = `
  query {
    postHowItWorksSection {
      content
    }
  }
`;

// the first name is same as the name of the list in the schima
// the second name idk same as what :)
export const GET_PREWHATTHEYSAYABOUTUS_QUERY = `
  query {
    preWhatTheySayAboutUsSection {
      content
    }
  }
`;

export const GET_WHYWORKWITHUS_QUERY = `
  query {
      whyWorkWithUsSection{
        title
        description
      }
    }
`;

export const GET_FAQS_QUERY = `
  query {
    faqSection {
      faqNb
      faqQuestion
      faqAnswer
    }
  }
`;

export const GET_TESTIMONIALS_QUERY = `
  query {
    testimonialsSection {
      iconSVG
      comment
      imageURL
      name
      role
    }
  }
`;

export const GET_BLOG_CARDS_QUERY = `
  query {
    blogCardSection {
      imageURL
      name
      readFrom
      content
    }
  }
`;

export const GET_ALL_JOBS_QUERY = `
  query {
    jobSection {
      id
      jobTitle
      postedFrom
      priceAmout
      priceType
      levelRequired
      jobDesc
      jobSkills {
        id
        name
      }
    }
  }
`;

export const GET_ACHIEVEMENTS_QUERY = `
  query {
    achievementSection {
      title
      count
      desc
    }
  }
`;

export const GET_MAWAHEB_QUERY = `
  query {
    mawahebSection {
      mawahebTopics {
        topic
      }
      mawahebDescription {
        description
      }
    }
  }
`;

export const GET_IMAGE_SWIPER_QUERY = `
  query {
    imageSwiperSection {
      imageURL
    }
  }
`;

export const GET_HOW_WE_MAKE_DIFF_QUERY = `
  query {
    howWeMakeDiffSection {
      id
      title
      description
      iconSVG
      belongingText
    }
  }
`;

export const GET_MEET_THE_TEAM_QUERY = `
  query {
    meetTheTeamSection {
      subHeadline {
        content
      }
      members {
        name
        position
        role
        imageURL
      }
    }
  }
`;

export const GET_WANT_TO_JOIN_US_QUERY = `
  query {
    wantToJoinUsSection {
      title
      subHeadline {
        content
      }
      emailbutton
    }
  }
`;
