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
// the second name is same as the one of the query lets say for now :)
export const GET_PREWHATTHEYSAYABOUTUS_QUERY = `
  query {
    preWhatTheySayAboutUsSection {
      content
    }
  }
`;
