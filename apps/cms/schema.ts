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
} satisfies Lists;
