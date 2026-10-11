"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { signUp, translateAuthError } from "@/services/auth-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function RegisterForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [emailSent, setEmailSent] = React.useState<string | null>(null);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false as unknown as true,
    },
  });

  async function onSubmit(values: RegisterInput) {
    setSubmitting(true);
    try {
      const data = await signUp(values);
      // Se la conferma email è disabilitata nel progetto Supabase, arriva già una sessione attiva.
      if (data.session) {
        toast.success("Account creato!", { description: "Benvenuto su Fanta3v3 Amantea." });
        router.push("/squadra");
        router.refresh();
      } else {
        setEmailSent(values.email);
      }
    } catch (error) {
      toast.error("Registrazione non riuscita", { description: translateAuthError(error) });
    } finally {
      setSubmitting(false);
    }
  }

  if (emailSent) {
    return (
      <Card className="glass-panel animate-fade-up text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Controlla la tua email</CardTitle>
          <CardDescription>
            Abbiamo inviato un link di conferma a <span className="font-semibold text-foreground">{emailSent}</span>.
            Aprilo per attivare il tuo account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link href="/login">Torna al login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel animate-fade-up">
      <CardHeader>
        <CardTitle className="text-2xl">Crea il tuo account</CardTitle>
        <CardDescription>Registrati per iniziare a costruire la tua squadra.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="mario_r" autoComplete="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome e cognome</FormLabel>
                    <FormControl>
                      <Input placeholder="Mario Rossi" autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" placeholder="mario.rossi@email.it" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput autoComplete="new-password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conferma password</FormLabel>
                    <FormControl>
                      <PasswordInput autoComplete="new-password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-start gap-2.5">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                    </FormControl>
                    <FormLabel className="text-sm font-normal text-muted-foreground">
                      Accetto il{" "}
                      <Link href="/regolamento" className="font-semibold text-primary hover:underline">
                        regolamento
                      </Link>{" "}
                      del torneo
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="mt-2" loading={submitting}>
              <UserPlus className="size-4" /> Crea account
            </Button>
          </form>
        </Form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Hai già un account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Accedi
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
