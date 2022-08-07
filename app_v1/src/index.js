import Fastify from "fastify";
import view from "@fastify/view";
import formbody from "@fastify/formbody";
import ejs from "ejs";
import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";

const prisma = new PrismaClient();

const fastify = Fastify({ logger: true });

fastify.register(view, { engine: { ejs } });
fastify.register(formbody);

fastify.get("/", (request, reply) => {
  reply.view("/src/templates/index.ejs");
});

fastify.get("/messages", async (request, reply) => {
  const messages = await prisma.message.findMany({
    orderBy: [{ id: "desc" }],
    select: { message: true },
  });
  return reply.view("/src/templates/messages.ejs", {
    messages: messages.map((message) => message.message),
  });
});

fastify.post("/post", async (request, reply) => {
  const name = request.body.input_name;
  const inputMessage = request.body.input_message;
  const timestamp = format(new Date(), "yyyy/MM/dd HH:mm:ss");
  await prisma.message.create({
    data: { name, message: inputMessage, timestamp },
  });
  return reply.view("/src/templates/post.ejs", { name, timestamp });
});

fastify.listen(
  ({ port: 80 },
  (err, address) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  })
);
