import { createApp } from "./app";
import * as store from "./store/agentStore";
import * as propertyStore from "./store/propertyStore";

const port = Number(process.env.PORT) || 3000;

store.seed();
propertyStore.seed(store.list()[0]);

createApp().listen(port, () => {
  console.log(`Property agent API listening on http://localhost:${port}`);
});
