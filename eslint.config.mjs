import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([
  {
    ignores: ["backend/dist/**", "dist/**", ".next/**"],
  },
  {
    extends: [...next],
    rules: {
        "react-hooks/exhaustive-deps": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "react/no-unescaped-entities": "off",
        "@next/next/no-img-element": "off",
        "react-hooks/set-state-in-effect": "off",
        "react-hooks/incompatible-library": "off"
    }
}]);

