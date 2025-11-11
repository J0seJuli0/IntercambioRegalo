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
    
    // Using a local state to prevent flicker and ensure redirection happens only once.
    const [isChecking, setIsChecking] = useState(true);

    const userDocRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userDocRef);

    useEffect(() => {
        // Only perform checks once loading is complete.
        if (!isUserLoading && !isProfileLoading) {
            if (!user) {
                // If no user is logged in, redirect to login.
                router.replace("/login");
            } else if (userProfile?.tipo_user !== 2) {
                // If user is not an admin, redirect to dashboard.
                router.replace("/dashboard");
            } else {
                // If user is an admin, stop checking and show content.
                setIsChecking(false);
            }
        }
    }, [isUserLoading, isProfileLoading, user, userProfile, router]);
    
    // While any data is loading or we are performing the check, show the loading screen.
    if (isChecking) {
        return <Loading />;
    }

    // Only when checks are passed, render the admin content.
    return <>{children}</>;
}
