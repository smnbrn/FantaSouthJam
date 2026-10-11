import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "La password deve avere almeno 8 caratteri")
  .regex(/[A-Z]/, "Deve contenere almeno una lettera maiuscola")
  .regex(/[0-9]/, "Deve contenere almeno un numero");

export const loginSchema = z.object({
  email: z.string().min(1, "Inserisci la tua email").email("Email non valida"),
  password: z.string().min(1, "Inserisci la tua password"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Almeno 3 caratteri")
      .max(24, "Massimo 24 caratteri")
      .regex(/^[a-zA-Z0-9_]+$/, "Solo lettere, numeri e underscore"),
    fullName: z.string().min(2, "Inserisci nome e cognome").max(80).optional().or(z.literal("")),
    email: z.string().min(1, "Inserisci la tua email").email("Email non valida"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Conferma la password"),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "Devi accettare il regolamento per continuare" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Inserisci la tua email").email("Email non valida"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Conferma la password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Almeno 3 caratteri")
    .max(24, "Massimo 24 caratteri")
    .regex(/^[a-zA-Z0-9_]+$/, "Solo lettere, numeri e underscore"),
  fullName: z.string().max(80).optional().or(z.literal("")),
});
export type ProfileInput = z.infer<typeof profileSchema>;
