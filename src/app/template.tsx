import { headers } from "next/headers";
import AppShell from "./components/AppShell";

export default async function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Rutas que NO usan el AppShell
  const noShellRoutes = ["/login"];
  const isNoShellRoute = noShellRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isNoShellRoute) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
