"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";

import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { updatePassword, translateAuthError } from "@/services/auth-service";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function ResetPasswordForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordInput) {
    setSubmitting(true);
    try {
      await updatePassword(values.password);
      toast.success("Password aggiornata", { description: "Ora puoi accedere con la nuova password." });
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error("Aggiornamento non riuscito", { description: translateAuthError(error) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="glass-panel animate-fade-up">
      <CardHeader>
        <CardTitle className="text-2xl">Imposta una nuova password</CardTitle>
        <CardDescription>Scegli una password sicura per il tuo account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nuova password</FormLabel>
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
                  <FormLabel>Conferma nuova password</FormLabel>
                  <FormControl>
                    <PasswordInput autoComplete="new-password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="mt-2" loading={submitting}>
              <KeyRound className="size-4" /> Aggiorna password
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
