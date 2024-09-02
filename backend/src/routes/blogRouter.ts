import { Hono } from "hono";
import { Bindings } from "..";
import { Variables } from "../index";
import { verify } from "hono/jwt";

export const blogRouter = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

blogRouter.use("/*", async (c, next) => {
  const jwt = c.req.header("Authorization");
  if (!jwt) {
    c.status(401);
    return c.json({ error: "Authorized header mein kuch bheja hi nhi" });
  }

  const token = jwt.split(" ")[1];
  const payload = await verify(token, c.env.JWT_SECRET);
  if (!payload) {
    c.status(401);
    return c.json({ error: "Gaalat token" });
  }
  c.set("userId", payload.id as string); //type error here, remove "as string" and see.
  await next();
});

blogRouter.post("/", (c) => {
  console.log(c.get("userId"));
  return c.text("blog post route");
});
blogRouter.put("/", (c) => {
  return c.text("blog put route");
});

blogRouter.get("/:id", (c) => {
  return c.text("blog route with id as query parameter");
});

blogRouter.get("/bulk", (c) => {
  return c.text("blog bulk route");
});
