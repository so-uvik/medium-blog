import { Hono } from "hono";
import { Bindings, getPrisma } from "../index";
import { sign } from "hono/jwt";

export const userRouter = new Hono<{
  Bindings: Bindings;
}>();

userRouter.post("/signup", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);

  const body = await c.req.json();
  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
        name: body.name,
      },
    });
    const token = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ id: user.id, jwt: token });
  } catch (e) {
    c.status(403);
    return c.json({ error: "error while signing up" });
  }
});

userRouter.post("/signin", async (c) => {
  const prisma = getPrisma(c.env.DATABASE_URL);

  const body = await c.req.json();
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
        password: body.password,
      },
    });

    if (!user)
      return c.json({
        error: "l*nd insaan signin kar rha hain, signup kiye bagair?",
      });

    const token = sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ jwt: token });
  } catch (error) {
    c.status(403);
    return c.json({ error: "nhi ho paya tera signin" });
  }
});
