'use client';

import { redirect } from 'next/navigation';

export default function ForgotPasswordPage() {
  // This page is disabled and redirects to the login page.
  redirect('/login');
}
