import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { blogRouter } from "./routes/blogRouter";
import { userRouter } from "./routes/userRouter";

export type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
};

export type Variables = {
  userId: string;
};

const app = new Hono<{
  Bindings: Bindings;
  Variables: Variables;
}>();

export const getPrisma = (databaseUrl: string) => {
  const prisma = new PrismaClient({
    datasourceUrl: databaseUrl,
  }).$extends(withAccelerate());

  return prisma;
};

app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);
export default app;
