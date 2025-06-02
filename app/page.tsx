// app/page.tsx
import { isAdminLoggedIn } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const loggedIn = await isAdminLoggedIn();
  if (loggedIn) {
    redirect("/admin/dashboard");
  } else {
    redirect("/login");
  }
  return null; // Or a simple landing page
}
