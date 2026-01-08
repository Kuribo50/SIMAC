import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ParametrosContent from "./components/ParametrosContent";

export default async function ParametrosPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Assuming only ADMINs can access this page
  if (user.rol !== "ADMINISTRADOR") {
    redirect("/");
  }

  return <ParametrosContent currentUser={user} />;
}
