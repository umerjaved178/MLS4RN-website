import { defineConfig } from "vitepress";

const repo = "https://github.com/umerjaved178/MLS4RN";

export default defineConfig({
  title: "MLS4RN",
  description:
    "End-to-end encrypted group messaging for web, mobile, and backend apps. Built on MLS (RFC 9420).",
  lang: "en-US",
  base: "/docs/",
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ["link", { rel: "icon", href: "/docs/favicon.svg", type: "image/svg+xml" }],
    ["meta", { name: "theme-color", content: "#6fddab" }],
    ["meta", { property: "og:title", content: "MLS4RN Documentation" }],
    [
      "meta",
      {
        property: "og:description",
        content:
          "End-to-end encrypted group messaging for web, mobile, and backend apps.",
      },
    ],
  ],

  themeConfig: {
    logo: "/logo.svg",
    siteTitle: "MLS4RN",

    nav: [
      { text: "Guide", link: "/guide/introduction" },
      { text: "Reference", link: "/reference/mls-ts" },
      { text: "Home", link: "https://mls4rn.dev" },
      { text: "Demo", link: "https://mls4rn.dev/#demo" },
      {
        text: "Packages",
        items: [
          { text: "mls-ts (Node + web)", link: "https://www.npmjs.com/package/mls-ts" },
          { text: "mls4rn (React Native)", link: "https://www.npmjs.com/package/mls4rn" },
        ],
      },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Getting started",
          items: [
            { text: "Introduction", link: "/guide/introduction" },
            { text: "How it works", link: "/guide/how-it-works" },
            { text: "Quickstart", link: "/guide/quickstart" },
          ],
        },
        {
          text: "Platforms",
          items: [
            { text: "Node.js", link: "/guide/nodejs" },
            { text: "Browser", link: "/guide/browser" },
            { text: "React Native", link: "/guide/react-native" },
          ],
        },
        {
          text: "Using the SDK",
          items: [
            { text: "Messages", link: "/guide/messages" },
            { text: "Managing members", link: "/guide/members" },
            { text: "File sharing", link: "/guide/file-sharing" },
            { text: "Saving sessions", link: "/guide/persistence" },
          ],
        },
        {
          text: "Going further",
          items: [
            { text: "The delivery server", link: "/guide/delivery-server" },
            { text: "Security model", link: "/guide/security" },
            { text: "Limitations", link: "/guide/limitations" },
            { text: "FAQ", link: "/guide/faq" },
          ],
        },
      ],
      "/reference/": [
        {
          text: "API reference",
          items: [
            { text: "mls-ts (Node + web)", link: "/reference/mls-ts" },
            { text: "mls4rn (React Native)", link: "/reference/mls4rn" },
            { text: "Delivery server", link: "/reference/server" },
          ],
        },
      ],
    },

    socialLinks: [{ icon: "github", link: repo }],

    editLink: {
      pattern: `${repo}/edit/main/docs/:path`,
      text: "Edit this page on GitHub",
    },

    search: { provider: "local" },

    footer: {
      message:
        'Released under the MIT License. Developed with support from the Prototype Fund.',
      copyright: "MLS4RN",
    },
  },
});
