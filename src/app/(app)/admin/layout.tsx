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
        if (!isUserLoading && !isProfileLoading) {
            if (!user) {
                router.replace("/login");
            } else if (userProfile?.role !== 'admin') {
                router.replace("/dashboard");
            }
        }
    }, [user, isUserLoading, userProfile, isProfileLoading, router]);


    if (isUserLoading || isProfileLoading || !userProfile || userProfile.role !== 'admin') {
        return <Loading />
    }

    return <>{children}</>;
}

    