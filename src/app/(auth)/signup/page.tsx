'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This page is no longer used for public signups.
// It redirects to the login page.
// Admin user creation is handled in the /admin/register-user page.
export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return null;
}

    