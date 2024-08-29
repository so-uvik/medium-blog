import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/api/v1/user/signup", (c) => {
  return c.text("Signup");
});

app.post("/api/v1/user/signin", (c) => {
  return c.text("signin");
});

app.post("/api/v1/blog", (c) => {
  return c.text("blog post route");
});
app.put("/api/v1/blog", (c) => {
  return c.text("blog put route");
});

app.get("/api/v1/blog/:id", (c) => {
  return c.text("blog route with id as query parameter");
});

app.get("/api/v1/blog/bulk", (c) => {
  return c.text("blog bulk route");
});

export default app;
