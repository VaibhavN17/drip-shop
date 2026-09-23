import "dotenv/config";
import { createApp } from "./app";

const app = createApp();
const port = Number(process.env.PORT) || 8787;

app.listen(port, () => {
  console.log(`API dev server listening on http://localhost:${port}`);
});
