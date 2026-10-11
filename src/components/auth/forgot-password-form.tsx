"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { sendPasswordResetEmail, translateAuthError } from "@/services/auth-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function ForgotPasswordForm() {
  const [submitting, setSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState<string | null>(null);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    setSubmitting(true);
    try {
      await sendPasswordResetEmail(values.email);
      setSent(values.email);
    } catch (error) {
      toast.error("Invio non riuscito", { description: translateAuthError(error) });
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <Card className="glass-panel animate-fade-up text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Email inviata</CardTitle>
          <CardDescription>
            Se esiste un account per <span className="font-semibold text-foreground">{sent}</span>, riceverai a
            breve un link per reimpostare la password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link href="/login">
              <ArrowLeft className="size-4" /> Torna al login
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel animate-fade-up">
      <CardHeader>
        <CardTitle className="text-2xl">Password dimenticata?</CardTitle>
        <CardDescription>Inserisci la tua email: ti mandiamo un link per reimpostarla.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
            <Button type="submit" className="mt-2" loading={submitting}>
              <Send className="size-4" /> Invia link di recupero
            </Button>
          </form>
        </Form>

        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-3.5" /> Torna al login
        </Link>
      </CardContent>
    </Card>
  );
}
