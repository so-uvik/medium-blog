import { Hono } from "hono";
import { Bindings, getPrisma } from "../index";
import { sign } from "hono/jwt";
import { signinInput, signupInput } from "@def4lt_dev/medium-common";

export const userRouter = new Hono<{
  Bindings: Bindings;
}>();

userRouter.post("/signup", async (c) => {
  //"/api/v1/user/signup"
  const prisma = getPrisma(c.env.DATABASE_URL);

  const body = await c.req.json();
  const { success, error } = signupInput.safeParse(body);
  if (!success) {
    c.status(400);
    return c.json({ message: "Wrong inputs provided", error: error });
  }
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
  //"/api/v1/user/signin"
  const prisma = getPrisma(c.env.DATABASE_URL);

  const body = await c.req.json();
  const { success, error } = signinInput.safeParse(body);
  if (!success) {
    c.status(400);
    return c.json({ message: "Wrong inputs provided", error: error.format() });
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
        password: body.password,
      },
    });

    if (!user) {
      c.status(400);
      return c.json({
        error: "l*nd insaan signin kar rha hain, signup kiye bagair?",
      });
    }

    const token = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ jwt: token });
  } catch (error) {
    c.status(403);
    return c.json({ error: "nhi ho paya tera signin" });
  }
});
