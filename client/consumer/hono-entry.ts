import { vikeHandler } from "./server/vike-handler";
import { Hono } from "hono";
import { createHandler } from "@universal-middleware/hono";
import { telefuncHandler } from "./server/telefunc-handler";

const app = new Hono();

app.post("/_telefunc", createHandler(telefuncHandler)());

/**
 * Vike route
 *
 * @link {@see https://vike.dev}
 **/
app.all("*", createHandler(vikeHandler)());

export default app;
