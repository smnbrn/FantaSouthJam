import { z } from "zod";

export const createTeamSchema = z.object({
  teamName: z
    .string()
    .min(3, "Almeno 3 caratteri")
    .max(40, "Massimo 40 caratteri")
    .regex(/^[a-zA-Z0-9À-ÿ' .-]+$/, "Solo lettere, numeri, spazi e - ' ."),
});
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
