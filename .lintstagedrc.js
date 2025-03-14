module.exports = {
  // Lint & prettify TS and JS files
  "**/*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
  // Prettify only JSON and Markdown files
  "**/*.{json,md}": ["prettier --write"],
};
