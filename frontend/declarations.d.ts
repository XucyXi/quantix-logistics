//Custom TypeScript declaration file for handling CSS imports in a project using TypeScript 6.0.2 with ESNext module system and ES2024 target.
// This file allows TypeScript to understand imports of CSS files, which is common in frontend projects using bundlers like Vite or Webpack.

// The declaration states that any import ending with .css will be treated as a module that exports a string (the CSS class names or styles).
declare module '*.css';
