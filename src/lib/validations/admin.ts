import { z } from "zod";

export const playerSchema = z.object({
  fullName: z.string().min(2, "Almeno 2 caratteri").max(80, "Massimo 80 caratteri"),
  realTeam: z.string().min(2, "Almeno 2 caratteri").max(60, "Massimo 60 caratteri"),
  role: z.string().min(2, "Almeno 2 caratteri").max(30, "Massimo 30 caratteri"),
  cost: z.coerce.number().int("Deve essere un numero intero").positive("Deve essere maggiore di 0"),
  photoUrl: z.string().url("URL non valido").optional().or(z.literal("")),
});
export type PlayerInput = z.infer<typeof playerSchema>;

export const assignScoreEventSchema = z.object({
  playerId: z.string().min(1, "Seleziona un giocatore"),
  bonusTypeId: z.string().min(1, "Seleziona un bonus/malus"),
  quantity: z.coerce.number().int("Deve essere un numero intero").min(1, "Almeno 1").max(20, "Massimo 20"),
});
export type AssignScoreEventInput = z.infer<typeof assignScoreEventSchema>;

export const matchdaySchema = z.object({
  status: z.enum(["upcoming", "open", "closed"]),
  matchDate: z.string().optional().or(z.literal("")),
  resultsSummary: z.string().max(300, "Massimo 300 caratteri").optional().or(z.literal("")),
});
export type MatchdayInput = z.infer<typeof matchdaySchema>;

export const settingsSchema = z
  .object({
    marketOpen: z.boolean(),
    registrationOpen: z.boolean(),
    budgetInitial: z.coerce.number().int().positive("Deve essere maggiore di 0"),
    rosterMaxSize: z.coerce.number().int().positive("Deve essere maggiore di 0"),
    rosterMaxStarters: z.coerce.number().int().positive("Deve essere maggiore di 0"),
    tournamentStartDate: z.string().optional().or(z.literal("")),
    rulesText: z.string().max(5000, "Massimo 5000 caratteri"),
  })
  .refine((data) => data.rosterMaxStarters <= data.rosterMaxSize, {
    message: "Non può superare la dimensione massima della rosa",
    path: ["rosterMaxStarters"],
  });
export type SettingsInput = z.infer<typeof settingsSchema>;
