export const GET_FEATURES_QUERY = `
  query {
    features {
      title
      description
    }
  }
`;

export const GET_SUBHEADLINE_QUERY = `
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
