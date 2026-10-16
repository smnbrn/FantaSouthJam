import { z } from "zod";

const optionalInt = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().int("Deve essere un numero intero").optional()
);

export const hallOfFameSchema = z.object({
  year: z.coerce.number().int().min(2000, "Anno non valido").max(2100, "Anno non valido"),
  winnerTeamName: z.string().trim().min(1, "Inserisci la squadra vincitrice").max(120),
  winnerCoach: z.string().trim().max(80).optional().or(z.literal("")),
  winnerPoints: optionalInt,
  topPlayerName: z.string().trim().min(1, "Inserisci il giocatore").max(120),
  topPlayerTeam: z.string().trim().max(120).optional().or(z.literal("")),
  topPlayerPoints: optionalInt,
  notes: z.string().trim().max(300, "Massimo 300 caratteri").optional().or(z.literal("")),
});
export type HallOfFameInput = z.infer<typeof hallOfFameSchema>;

export const chatMessageSchema = z.object({
  content: z.string().trim().min(1, "Scrivi qualcosa").max(500, "Massimo 500 caratteri"),
});
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
