import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // These React Compiler-derived rules assume components adopt the compiler
      // (not enabled here) or a fetch library like SWR/React Query. This project
      // deliberately uses plain useEffect + fetch-on-mount, which is a correct,
      // widely-used pattern the rule doesn't recognize — keep as a warning rather
      // than a build-breaking error.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/incompatible-library": "warn",
    },
  },
];

export default eslintConfig;
