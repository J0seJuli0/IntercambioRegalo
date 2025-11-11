'use client';
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import AppSidebar, { MobileHeader } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useUser } from "@/firebase";
import Loading from "./loading";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import type { User } from "@/lib/types";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userDocRef);

  useEffect(() => {
    const isFinishedLoading = !isUserLoading && !isProfileLoading;

    if (isFinishedLoading) {
      if (!user) {
        // If not logged in at all, redirect to login.
        router.push('/login');
      } else if (pathname.startsWith('/admin') && userProfile?.tipo_user !== 2) {
        // If logged in, but trying to access admin routes without being an admin, redirect.
        router.replace('/dashboard');
      }
    }
  }, [user, userProfile, isUserLoading, isProfileLoading, pathname, router]);

  // Show a loading state while we verify auth and profile data.
  if (isUserLoading || isProfileLoading || !userProfile) {
    // If we're on an admin path, a brief loading is expected and fine.
    // If the user object is not available yet, we also show loading.
     if (!user || pathname.startsWith('/admin')) {
       return <Loading />;
     }
  }
  
  // After all checks, if user is not an admin and on an admin route, they will have been redirected.
  // We can render the layout. The sidebar will correctly show/hide admin menus based on the profile.
  return (
    <SidebarProvider>
      <div className="md:flex">
        <AppSidebar userProfile={userProfile} />
        <main className="flex-1">
          <MobileHeader />
          <SidebarInset>
            {children}
          </SidebarInset>
        </main>
      </div>
    </SidebarProvider>
  );
}
