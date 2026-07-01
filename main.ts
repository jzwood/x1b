import { main } from "./src/x1b/x1b.ts";
import { SHOW_CURSOR } from "./src/x1b/escape_codes.ts";
import { cmd } from "./src/x1b/utils.ts";

if (import.meta.main) {
  main()
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      cmd(SHOW_CURSOR);
    });
}
