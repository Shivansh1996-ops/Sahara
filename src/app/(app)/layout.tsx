"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { usePetStore } from "@/stores/pet-store";
import { useFeatureGateStore } from "@/stores/feature-gate-store";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { UnlockTransition } from "@/components/unlock-transition";
import { EmergencyButton } from "@/components/crisis/emergency-button";
import { LoadingScreen } from "@/components/ui/loading";

// Pages that require unlock (10 chats completed)
const LOCKED_PAGES = ["/pets", "/dashboard", "/tools", "/assessments", "/community", "/profile"];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: authLoading, isAuthenticated, initialize } = useAuthStore();
  const { fetchPets, fetchUserPet } = usePetStore();
  const { fetchFeatureGate, isFullyUnlocked, isLoading: featureLoading } = useFeatureGateStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchFeatureGate(user.id);
      // Only fetch pets if unlocked
      if (isFullyUnlocked) {
        fetchPets();
        fetchUserPet(user.id);
      }
    }
  }, [isAuthenticated, user, fetchPets, fetchUserPet, fetchFeatureGate, isFullyUnlocked]);

  // Redirect to chat if trying to access locked pages
  useEffect(() => {
    if (!featureLoading && !isFullyUnlocked && LOCKED_PAGES.some(page => pathname?.startsWith(page))) {
      router.push("/");
    }
  }, [featureLoading, isFullyUnlocked, pathname, router]);

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  // Show loading while checking feature gate for locked pages
  if (featureLoading && LOCKED_PAGES.some(page => pathname?.startsWith(page))) {
    return <LoadingScreen />;
  }

  return (
    <div className={`min-h-screen bg-gradient-calm ${isFullyUnlocked ? 'pb-20' : ''}`}>
      {children}
      <BottomNav />
      <UnlockTransition />
      <EmergencyButton />
    </div>
  );
}
