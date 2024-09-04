import { Hono } from "hono";
import { Bindings, getPrisma } from "..";
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

blogRouter.post("/", async (c) => {
  // Route: create a new post
  // Requires: body : {
  // title: blog title,
  // content: blog content
  // }
  const userId = c.get("userId");
  const prisma = getPrisma(c.env.DATABASE_URL);
  const body = await c.req.json();
  try {
    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: userId,
      },
    });
    return c.json({ id: post.id });
  } catch (e) {
    c.status(401);
    return c.json({ error: e });
  }
});
blogRouter.put("/", async (c) => {
  // Route: update-blog
  // Requires: body : {
  //  id: id of the specific blog to be updated,
  //  title: title of the updated blog,
  //  content: content of the updated blog
  // }
  const prisma = getPrisma(c.env.DATABASE_URL);
  const userId = c.get("userId");
  const body = await c.req.json();
  try {
    await prisma.post.update({
      where: {
        id: body.id,
        authorId: userId,
      },
      data: {
        title: body.title,
        content: body.content,
      },
    });
    return c.json({ message: "post has been updated" });
  } catch (error) {
    c.status(401);
    return c.json({ error: error });
  }
});

blogRouter.get("/bulk", async (c) => {
  // Route: get all blogs
  // Requires: Only the JWT to be set in the headers, Authorization = Bearer <the actual JWT>
  const prisma = getPrisma(c.env.DATABASE_URL);
  try {
    const posts = await prisma.post.findMany();
    return c.json({ posts: posts });
  } catch (error) {
    c.status(401);
    c.json({ error: error });
  }
});

blogRouter.get("/:id", async (c) => {
  // Route: Get Specific Blog by id
  // Requires: - Specific blog id to be specified in the url,
  const prisma = getPrisma(c.env.DATABASE_URL);
  const id = c.req.param("id");
  try {
    const post = await prisma.post.findUnique({
      where: {
        id: id,
      },
    });
    return c.json(post);
  } catch (e) {
    c.status(401);
    c.json({ error: e });
  }
});

// All the routes with optional parameters, like the one above should be at the end, failing which a request to /api/v1/blog/bulk will
// be matched by /api/v1/blog/:id
// instead of being matched by the dedictated /api/v1/blog/bulk route handler. Or else plan your route url's correctly.
