import { z } from "zod";

const slug = z
  .string()
  .trim()
  .min(3, "El enlace debe tener al menos 3 caracteres")
  .max(70)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa minúsculas, números y guiones");

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const eventSchema = z.object({
  title: z.string().trim().min(3).max(140),
  slug,
  recipientName: z.string().trim().min(1).max(80),
  intro: z.string().trim().max(1200).default(""),
  scheduledFor: z.string().optional().default(""),
  coverImage: z.string().max(1000).optional().default(""),
  accent: z.enum(["blue", "pink", "yellow", "mint"]).default("pink"),
  status: z.enum(["draft", "published"]).default("published"),
  blocks: z
    .array(
      z.object({
        id: z.string().min(1).max(80),
        type: z.enum(["message", "text_input", "yes_no", "choices", "date", "photo", "gift"]),
        label: z.string().max(300).default(""),
        description: z.string().max(800).optional(),
        required: z.boolean().optional(),
        options: z.array(z.string().max(120)).max(8).optional(),
        desiredAnswer: z.string().max(120).optional(),
        trickMode: z.enum(["none", "runaway", "vanish", "grow", "swap"]).optional(),
        imageUrl: z.string().max(1000).optional(),
        linkUrl: z.string().max(1000).optional(),
        giftTitle: z.string().max(180).optional(),
        dateValue: z.string().max(60).optional(),
      }),
    )
    .min(1)
    .max(30),
});

export const responseSchema = z.object({
  recipientName: z.string().trim().min(1).max(80),
  answers: z
    .array(
      z.object({
        blockId: z.string().min(1),
        label: z.string().max(300),
        value: z.string().max(1600),
      }),
    )
    .max(30),
});
