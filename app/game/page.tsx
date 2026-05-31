import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import GameClient from "@/components/GameClient";

export default async function GamePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <GameClient user={user} />;
}
