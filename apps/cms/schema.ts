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
      title: text({ validation: { isRequired: false } }),
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
} satisfies Lists;
