'use client';
import { useDoc, useFirestore, useUser } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
        const isDataLoaded = !isUserLoading && !isProfileLoading;

        if (isDataLoaded) {
            if (!user) {
                // If all data is loaded and there's no user, redirect to login
                router.replace("/login");
            } else if (userProfile?.tipo_user !== 2) {
                // If there's a user but they are not an admin, redirect to dashboard
                router.replace("/dashboard");
            }
        }
        // This effect runs whenever the loading or data states change.
    }, [user, userProfile, isUserLoading, isProfileLoading, router]);

    // Show loading state while we wait for user and profile data.
    // Also, cover the case where `user` is loaded but `userProfile` is still loading.
    if (isUserLoading || isProfileLoading) {
        return <Loading />;
    }
    
    // Once everything is loaded, if the user is an admin, show the children.
    // The useEffect above will handle non-admin redirection.
    if (user && userProfile?.tipo_user === 2) {
        return <>{children}</>;
    }

    // Fallback loading state for the brief moment before redirection occurs.
    return <Loading />;
}
