'use client';
import { useDoc, useFirestore, useUser } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "../loading";
import type { User } from "@/lib/types";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userDocRef);

    useEffect(() => {
        // Wait until both user and profile are done loading
        if (!isUserLoading && !isProfileLoading) {
            if (!user) {
                router.replace("/login");
            } else if (userProfile?.tipo_user !== 2) {
                router.replace("/dashboard");
            }
        }
    }, [user, userProfile, isUserLoading, isProfileLoading, router]);

    // Show loading state while we wait for user and profile data.
    if (isUserLoading || isProfileLoading || !userProfile) {
        return <Loading />;
    }
    
    // If the user is an admin, show the children. Otherwise, this will be null
    // for a brief moment before the redirect in useEffect happens.
    if (userProfile?.tipo_user === 2) {
        return <>{children}</>;
    }

    // Fallback loading state for the brief moment before redirection occurs.
    return <Loading />;
}
