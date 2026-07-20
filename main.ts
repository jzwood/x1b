import { main } from "./src/x1b.ts";
import { SHOW_CURSOR } from "./src/escape_codes.ts";
import { cmd } from "./src/utils.ts";

if (import.meta.main) {
  main()
    .catch((err) => {
      console.error(err);
      cmd(SHOW_CURSOR);
    });
}
