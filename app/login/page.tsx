// app/login/page.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { attemptLogin } from "@/lib/actions"; // Import the Server Action
import { useToast } from "@/hooks/use-toast";

// Remove the inline server action:
// async function attemptLogin(password: string): Promise<{ success: boolean; message: string }> {
//   "use server";
//   const { login } = await import("@/lib/auth");
//   const success = await login(password);
//   if (success) {
//     return { success: true, message: "Login successful!" };
//   }
//   return { success: false, message: "Invalid password." };
// }

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      // Call the imported Server Action
      const result = await attemptLogin(password);
      if (result.success) {
        toast({ title: "Success", description: result.message });
        router.push("/admin/dashboard");
        router.refresh(); // Important to re-evaluate layouts/middleware
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-semibold mb-6 text-center">Admin Login</h1>
        <div className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isPending}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
  );
}
