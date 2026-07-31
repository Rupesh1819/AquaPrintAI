import { redirect } from "next/navigation";

export default function Home() {
  // For Milestone 2, we just redirect to the dashboard to view the core shell
  redirect("/dashboard");
}
