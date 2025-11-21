"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/components/ReactQueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const PUBLIC_ROUTES = ["/login", "/signup","/signup/success",  "/forgot-password", "/reset-password"];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // If this is a mobile route (/m/*), skip all desktop checks
    // Mobile layout will handle its own auth and redirects
    if (pathname.startsWith('/m')) {
      return;
    }

    // Mobile redirect logic
    // TODO: When deploying to production, update this to redirect to m.gajuri.com
    const checkMobileAndRedirect = () => {
      // Check if screen is mobile size (width < 640px)
      const isMobileScreen = window.innerWidth < 640;

      if (isMobileScreen && !pathname.startsWith('/m')) {
        // For localhost: redirect to /m path
        router.push(`/m${pathname}`);

        // For production, uncomment this instead:
        // const currentUrl = new URL(window.location.href);
        // currentUrl.hostname = `m.${currentUrl.hostname}`;
        // window.location.href = currentUrl.toString();
      }
    };

    // Run check on mount
    checkMobileAndRedirect();

    // Also check on window resize
    const handleResize = () => checkMobileAndRedirect();
    window.addEventListener('resize', handleResize);

    // Check if current route is public
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    // If it's a public route, no need to check auth
    if (isPublicRoute) {
      return () => window.removeEventListener('resize', handleResize);
    }

    // Check authentication keys in localStorage
    const authToken = localStorage.getItem("gajuri-authToken");
    const userProfile = localStorage.getItem("chemiki-userProfile");

    // If either key is missing, redirect to login
    if (!authToken || !userProfile) {
      router.push("/login");
    }

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [pathname, router]);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          {children}
        </ReactQueryProvider>

      </body>
    </html>
  );
}