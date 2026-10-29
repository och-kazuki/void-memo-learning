import { defineEnv, string } from "void/env";

// Optional so `void deploy` can still create BETTER_AUTH_SECRET itself.
// A production build preview reads this from the gitignored `.env`.
export default defineEnv({
  BETTER_AUTH_SECRET: string().optional(),
});
