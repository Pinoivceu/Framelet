import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("email,full_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="studio-page">
      <header className="studio-header">
        <Logo href="/dashboard" />
        <Link className="back-link" href="/dashboard">Back to widgets</Link>
      </header>
      <div className="profile-shell">
        <p className="kicker">Account</p>
        <h1>Your profile</h1>
        <p className="profile-intro">
          This is the name shown inside your studio. Your email is managed by your sign-in provider.
        </p>
        <ProfileForm
          email={profile?.email || user.email || ""}
          initialName={profile?.full_name || ""}
        />
      </div>
    </main>
  );
}
