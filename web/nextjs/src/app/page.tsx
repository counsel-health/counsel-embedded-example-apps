import { redirect } from "next/navigation";

/**
 * Redirect to the dashboard page
 */
export default function Home() {
  redirect("/dashboard");
}
