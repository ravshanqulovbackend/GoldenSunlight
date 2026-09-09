"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register as registerUser } from "@/lib/api/endpoints/auth";
import { useAuthStore } from "@/lib/stores/authStore";
import { parseApiError } from "@/lib/api/parseApiError";
import { toast } from "@/lib/stores/toastStore";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { registerSchema, type RegisterFormValues } from "@/lib/utils/validators";

export function RegisterForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register: registerField,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const mutation = useMutation({
    mutationFn: (values: RegisterFormValues) => registerUser(values),
    onSuccess: ({ user, tokens }) => {
      setAuth(tokens, user);
      toast(`Welcome, ${user.first_name || user.username}!`, "success");
      router.push("/");
    },
    onError: (error) => toast(parseApiError(error).message || "Registration failed", "error"),
  });

  return (
    <Card className="p-6 sm:p-8">
      <h1 className="headline-md mb-6 text-center text-on-surface">Sign Up</h1>
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-4">
        <Input label="Username" autoComplete="username" autoFocus error={errors.username?.message} {...registerField("username")} />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...registerField("password")}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="First name" autoComplete="given-name" error={errors.first_name?.message} {...registerField("first_name")} />
          <Input label="Last name" autoComplete="family-name" error={errors.last_name?.message} {...registerField("last_name")} />
        </div>
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <PhoneInput label="Phone" error={errors.phone?.message} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
          )}
        />
        <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...registerField("email")} />
        <Button type="submit" size="lg" disabled={mutation.isPending} className="mt-2">
          {mutation.isPending ? "Submitting..." : "Sign Up"}
        </Button>
      </form>
      <p className="body-md mt-6 text-center text-on-surface-variant">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </Card>
  );
}
