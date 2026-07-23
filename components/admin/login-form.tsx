"use client";

import { useActionState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { login } from "@/app/(admin)/login/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = { success: false, message: "" };

export function LoginForm({ demoMode }: { demoMode: boolean }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <Label htmlFor="email">Email address</Label>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="editor@kitchenmadehealth.com" required={!demoMode} />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <span className="mb-2 text-xs text-stone">Private team access</span>
        </div>
        <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••••" required={!demoMode} />
      </div>
      {state.message && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-bold text-white transition hover:bg-black disabled:opacity-60"
      >
        {pending ? <LoaderCircle size={17} className="animate-spin" /> : demoMode ? "Open demo dashboard" : "Sign in"}
        {!pending && <ArrowRight size={17} />}
      </button>
      {demoMode && (
        <p className="text-center text-xs leading-5 text-stone">
          Supabase is not connected yet. No credentials are needed for this preview.
        </p>
      )}
    </form>
  );
}
