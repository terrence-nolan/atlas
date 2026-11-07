import { z } from "zod";

export const currentBookConfigSchema = z.object({
  googleBooksId: z.string().min(1),
  currentPage: z.number().int().nonnegative(),
  startedAt: z.iso.date(),
  progressUpdatedAt: z.iso.date(),
});

export type CurrentBookConfig = z.infer<
  typeof currentBookConfigSchema
>;
