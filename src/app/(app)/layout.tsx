'use client';
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AppSidebar, { MobileHeader } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useUser } from "@/firebase";
import Loading from "./loading";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return <Loading />;
  }

  return (
    <SidebarProvider>
      <div className="md:flex">
        <AppSidebar />
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
