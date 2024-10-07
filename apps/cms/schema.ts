// Import `document` from the correct package
import { document } from "@keystone-6/fields-document";
import { list } from "@keystone-6/core";
import { allowAll } from "@keystone-6/core/access";
import {
  text,
  integer,
  relationship,
  password,
  timestamp,
  json,
} from "@keystone-6/core/fields";
import { Lists } from ".keystone/types";

// The updated lists for the HowItWorks feature
export const lists = {
  User: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({ validation: { isRequired: true }, isIndexed: "unique" }),
      password: password({ validation: { isRequired: true } }),
      posts: relationship({ ref: "Post.author", many: true }),
      createdAt: timestamp({ defaultValue: { kind: "now" } }),
    },
  }),

  Post: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      // Correctly using the `document` field from the correct package
      content: document({
        formatting: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1],
        ],
        links: true,
        dividers: true,
      }),
      author: relationship({
        ref: "User.posts",
        ui: {
          displayMode: "cards",
          cardFields: ["name", "email"],
          inlineEdit: { fields: ["name", "email"] },
          linkToItem: true,
          inlineConnect: true,
        },
        many: false,
      }),
      tags: relationship({
        ref: "Tag.posts",
        many: true,
        ui: {
          displayMode: "cards",
          cardFields: ["name"],
          inlineEdit: { fields: ["name"] },
          linkToItem: true,
          inlineConnect: true,
          inlineCreate: { fields: ["name"] },
        },
      }),
    },
  }),

  Tag: list({
    access: allowAll,
    ui: {
      isHidden: true,
    },
    fields: {
      name: text(),
      posts: relationship({ ref: "Post.tags", many: true }),
    },
  }),

  Feature: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      description: text({
        ui: { displayMode: "textarea" },
        validation: { isRequired: true },
      }),
    },
  }),

  forEmployersSubHeadline: list({
    access: allowAll,
    fields: {
      content: text({ validation: { isRequired: true } }),
    },
  }),

  HowItWorks: list({
    access: allowAll,
    fields: {
      stepNb: integer({ validation: { isRequired: true } }),
      title: text({ validation: { isRequired: true } }),
      description: text({
        ui: { displayMode: "textarea" },
        validation: { isRequired: true },
      }),
      imageURL: text({ validation: { isRequired: false } }),
    },
    // Specify the plural name for GraphQL queries to avoid conflict
    graphql: {
      plural: "HowItWorksItems", // Or any plural form that makes sense for your data
    },
  }),

  PostHowItWorks: list({
    access: allowAll,
    fields: {
      content: text({ validation: { isRequired: true } }),
    },
    graphql: {
      plural: "PostHowItWorksSection", // This needs to be different from the list name
    },
  }),

  PreWhatTheySayAboutUs: list({
    access: allowAll,
    fields: {
      content: text({ validation: { isRequired: true } }),
    },
    graphql: {
      plural: "PreWhatTheySayAboutUsSection", // different also
    },
  }),

  WhyWorkWithUs: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      description: text({
        ui: { displayMode: "textarea" },
        validation: { isRequired: true },
      }),
    },
    graphql: {
      plural: "whyWorkWithUsSection", // Custom plural name for the GraphQL API
    },
  }),

  FAQs: list({
    access: allowAll,
    fields: {
      faqNb: integer({ validation: { isRequired: true } }),
      faqQuestion: text({ validation: { isRequired: true } }),
      faqAnswer: text({
        ui: { displayMode: "textarea" },
        validation: { isRequired: true },
      }),
    },
    graphql: {
      plural: "faqSection", // this name should be same as the one created in the loader
    },
  }),

  Testimonials: list({
    access: allowAll,
    fields: {
      iconSVG: text({ validation: { isRequired: false } }),
      comment: text({
        ui: { displayMode: "textarea" },
        validation: { isRequired: true },
      }),
      imageURL: text({ validation: { isRequired: false } }),
      name: text({ validation: { isRequired: true } }),
      role: text({ validation: { isRequired: true } }),
    },
    // Specify the plural name for GraphQL queries to avoid conflict
    graphql: {
      plural: "testimonialsSection", // Or any plural form that makes sense for your data
    },
  }),

  BlogCards: list({
    access: allowAll,
    fields: {
      imageURL: text({ validation: { isRequired: false } }),
      name: text({ validation: { isRequired: false } }),
      readFrom: text({ validation: { isRequired: true } }),
      content: text({
        ui: { displayMode: "textarea" },
        validation: { isRequired: true },
      }),
    },
    // Specify the plural name for GraphQL queries to avoid conflict
    graphql: {
      plural: "blogCardSection", // Or any plural form that makes sense for your data
    },
  }),

  Skill: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
    },
    ui: {
      isHidden: true,
      listView: {
        initialColumns: ["name"],
      },
    },
  }),

  Job: list({
    access: allowAll,
    fields: {
      jobTitle: text({ validation: { isRequired: false } }),
      postedFrom: integer({ validation: { isRequired: true } }),
      priceAmout: integer({ validation: { isRequired: true } }),
      priceType: text({ validation: { isRequired: true } }),
      levelRequired: text({ validation: { isRequired: true } }),
      jobDesc: text({
        ui: { displayMode: "textarea" },
        validation: { isRequired: true },
      }),
      // Define a relationship with the Skill model
      jobSkills: relationship({
        ref: "Skill",
        many: true, // This allows selecting multiple skills
        ui: {
          displayMode: "cards", // Makes it visually appealing
          cardFields: ["name"], // Display skill name in the card
          inlineCreate: { fields: ["name"] }, // Allow creating new skills directly
          inlineEdit: { fields: ["name"] }, // Allow editing skills inline
        },
      }),
    },
    graphql: {
      plural: "jobSection",
    },
  }),

  Achievement: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      count: integer({ validation: { isRequired: true } }),
      desc: text({
        ui: { displayMode: "textarea" },
        validation: { isRequired: true },
      }),
    },
    graphql: {
      plural: "achievementSection", // same as the query inner name ❤️
    },
  }),

  MawahebTopic: list({
    access: allowAll,
    fields: {
      topic: text({
        ui: { displayMode: "textarea" },
        validation: { isRequired: true },
      }),
    },
    ui: {
      isHidden: true,
      listView: {
        initialColumns: ["topic"],
      },
    },
  }),

  MawahebDescription: list({
    access: allowAll,
    fields: {
      description: text({
        ui: { displayMode: "textarea" },
        validation: { isRequired: true },
      }),
    },
    ui: {
      isHidden: true,
      listView: {
        initialColumns: ["description"],
      },
    },
  }),

  Mawaheb: list({
    access: allowAll,
    fields: {
      mawahebTopics: relationship({
        ref: "MawahebTopic", // Relates to MawahebTopic
        many: true, // Allows multiple topics to be added
        ui: {
          displayMode: "cards",
          cardFields: ["topic"], // Show topic name on card
          inlineCreate: { fields: ["topic"] }, // Allow creating new topics inline
          inlineEdit: { fields: ["topic"] }, // Allow editing topics inline
        },
      }),
      mawahebDescription: relationship({
        ref: "MawahebDescription", // Relates to MawahebDescription
        many: true, // Allows multiple descriptions to be added
        ui: {
          displayMode: "cards",
          cardFields: ["description"], // Show description on card
          inlineCreate: { fields: ["description"] }, // Allow creating new descriptions inline
          inlineEdit: { fields: ["description"] }, // Allow editing descriptions inline
        },
      }),
    },
    graphql: {
      plural: "mawahebSection", // GraphQL plural name for Mawaheb
    },
  }),

  ImageSwiper: list({
    access: allowAll,
    fields: {
      imageURL: text({ validation: { isRequired: true } }),
    },
    graphql: {
      plural: "imageSwiperSection", // GraphQL plural name for Mawaheb
    },
  }),

  HowWeMakeDiff: list({
    access: allowAll,
    fields: {
      boxId: integer({ validation: { isRequired: true } }),
      title: text({ validation: { isRequired: true } }),
      description: text({
        ui: { displayMode: "textarea" },
        validation: { isRequired: true },
      }),
      iconSVG: text({ validation: { isRequired: false } }),
      belongingText: text({
        ui: { displayMode: "textarea" },
        validation: { isRequired: true },
      }),
    },
    graphql: {
      plural: "HowWeMakeDiffSection",
    },
  }),

  SubHeadline: list({
    access: allowAll,
    fields: {
      content: text({
        ui: { displayMode: "textarea" }, // This will be a textarea field
        validation: { isRequired: true },
      }),
    },
    ui: {
      isHidden: true, // Hide from the admin UI main page
    },
    graphql: {
      plural: "subHeadlines", // GraphQL API plural name
    },
  }),

  AddAMember: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }), // Member name
      position: text({ validation: { isRequired: true } }), // Member position
      role: text({ validation: { isRequired: true } }), // Member role
      imageURL: text({ validation: { isRequired: true } }), // Member profile picture
    },
    ui: {
      isHidden: true, // Hide from the admin UI main page
      listView: {
        initialColumns: ["name", "position", "role"], // Display key fields in the list view
      },
    },
    graphql: {
      plural: "teamMembers", // Custom plural name for the GraphQL API
    },
  }),

  MeetTheTeam: list({
    access: allowAll,
    fields: {
      // Set up a relationship field to the SubHeadline model
      subHeadline: relationship({
        ref: "SubHeadline", // Reference the SubHeadline model
        ui: {
          displayMode: "cards", // Display as cards for better UI
          cardFields: ["content"], // Show the content of SubHeadline on the card
          inlineCreate: { fields: ["content"] }, // Allow inline creation of SubHeadline
          inlineEdit: { fields: ["content"] }, // Allow inline editing of SubHeadline
        },
      }),
      // Add the relationship to AddAMember data model
      members: relationship({
        ref: "AddAMember", // Reference the AddAMember model
        many: true, // I can add so many members
        ui: {
          displayMode: "cards", // Display members as cards
          cardFields: ["name", "position", "role", "imageURL"], // Display these fields on the card
          inlineCreate: { fields: ["name", "position", "role", "imageURL"] }, // Allow creating new members inline
          inlineEdit: { fields: ["name", "position", "role", "imageURL"] }, // Allow editing members inline
        },
      }),
    },
    ui: {
      listView: {
        initialColumns: ["subHeadline", "members"], // Display subHeadline and members in list view
      },
    },
    graphql: {
      plural: "meetTheTeamSection", // Custom plural name for GraphQL API
    },
  }),

  WantToJoinUs: list({
    access: allowAll,
    fields: {
      title: text({ validation: { isRequired: true } }),
      // Set up a relationship field to the SubHeadline model
      subHeadline: relationship({
        ref: "SubHeadline", // Reference the SubHeadline model
        ui: {
          displayMode: "cards", // Display as cards for better UI
          cardFields: ["content"], // Show the content of SubHeadline on the card
          inlineCreate: { fields: ["content"] }, // Allow inline creation of SubHeadline
          inlineEdit: { fields: ["content"] }, // Allow inline editing of SubHeadline
        },
      }),
      emailbutton: text({ validation: { isRequired: true } }),
    },
    graphql: {
      plural: "wantToJoinUsSection", // Custom plural name for GraphQL API
    },
  }),
} satisfies Lists;
