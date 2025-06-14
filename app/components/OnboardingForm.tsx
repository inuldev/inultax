"use client";

import { useActionState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { onboardUser } from "../actions";
import { SubmitButton } from "./SubmitButtons";
import { onboardingSchema } from "../utils/zodSchemas";

export default function OnboardingForm() {
  const [lastResult, action] = useActionState(onboardUser, undefined);
  const [form, fields] = useForm({
    lastResult,

    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: onboardingSchema,
      });
    },

    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <div className="min-h-screen w-screen flex items-center justify-center">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#c9d9e9,transparent)]" />
      </div>
      <Card className="max-w-sm mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">Hampir Selesai!</CardTitle>
          <CardDescription>
            Masukkan informasi Anda untuk melengkapi akun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            action={action}
            id={form.id}
            onSubmit={form.onSubmit}
            noValidate
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Nama Depan</Label>
                <Input
                  name={fields.firstName.name}
                  key={fields.firstName.key}
                  defaultValue={fields.firstName.initialValue}
                  placeholder="Budi"
                />
                <p className="text-red-500 text-sm">
                  {fields.firstName.errors}
                </p>
              </div>
              <div className="grid gap-2">
                <Label>Nama Belakang</Label>
                <Input
                  name={fields.lastName.name}
                  key={fields.lastName.key}
                  defaultValue={fields.lastName.initialValue}
                  placeholder="Santoso"
                />
                <p className="text-red-500 text-sm">{fields.lastName.errors}</p>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Alamat</Label>
              <Input
                name={fields.address.name}
                key={fields.address.key}
                defaultValue={fields.address.initialValue}
                placeholder="Jl. Merdeka No. 123, Jakarta"
              />
              <p className="text-red-500 text-sm">{fields.address.errors}</p>
            </div>

            {lastResult && "error" in lastResult && lastResult.error?.[""] && (
              <div className="text-red-500 text-sm text-center">
                {lastResult.error[""]}
              </div>
            )}

            <SubmitButton
              text="Selesaikan Onboarding"
              loadingText="Menyimpan data..."
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
