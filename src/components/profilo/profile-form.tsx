"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { profileSchema, type ProfileInput } from "@/lib/validations/auth";
import { updateProfile, translateAuthError } from "@/services/auth-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function ProfileForm({ username, fullName }: { username: string; fullName: string | null }) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username, fullName: fullName ?? "" },
  });

  async function onSubmit(values: ProfileInput) {
    setSubmitting(true);
    try {
      await updateProfile({ username: values.username, fullName: values.fullName ?? "" });
      toast.success("Profilo aggiornato");
      form.reset(values);
      router.refresh();
    } catch (error) {
      const message = translateAuthError(error);
      if (message.toLowerCase().includes("username")) {
        form.setError("username", { message });
      } else {
        toast.error("Salvataggio non riuscito", { description: message });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dati del profilo</CardTitle>
        <CardDescription>Lo username compare in classifica come allenatore della tua squadra.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input autoComplete="username" {...field} />
                  </FormControl>
                  <FormDescription>Da 3 a 24 caratteri: lettere, numeri e underscore.</FormDescription>
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
                    <Input autoComplete="name" placeholder="Facoltativo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="self-start" loading={submitting} disabled={!form.formState.isDirty}>
              Salva modifiche
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
