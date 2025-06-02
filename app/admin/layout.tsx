// app/admin/layout.tsx
import { isAdminLoggedIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner"; // Or your preferred toaster

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const loggedIn = await isAdminLoggedIn();

  if (!loggedIn) {
    redirect("/login");
  }

  return (
    <div>
      {/* You can add an admin navbar here if needed */}
      {children}
      <Toaster richColors /> {/* For react-hot-toast / sonner */}
    </div>
  );
}
