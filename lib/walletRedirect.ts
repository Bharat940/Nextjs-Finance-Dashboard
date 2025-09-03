"use client"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export function useRequireWalletRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkWallet = async () => {
      try {
        const res = await fetch("/api/wallets", { credentials: "include" });
        const wallets = await res.json();

        if (Array.isArray(wallets)) {
          const onLoginOrRegister = pathname === "/login" || pathname === "/register";

          if (wallets.length === 0 && !pathname.startsWith("/create-wallet")) {
            if (onLoginOrRegister) {
              router.replace(`/create-wallet?redirect=${encodeURIComponent(pathname)}`);
              return;
            }
            router.replace(`/create-wallet?redirect=${encodeURIComponent(pathname)}`);
            return;
          }

          if (wallets.length > 0 && pathname.startsWith("/create-wallet")) {
            const urlParams = new URLSearchParams(window.location.search);
            const redirectTo = urlParams.get("redirect") || "/dashboard";
            router.replace(redirectTo);
            return;
          }
        }
      } catch (err) {
        console.log(err);
      }
    };

    checkWallet();
  }, [pathname, router]);
}
