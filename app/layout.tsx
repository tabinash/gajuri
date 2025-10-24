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
    // Check if current route is public
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    // If it's a public route, no need to check auth
    if (isPublicRoute) {
      return;
    }

    // Check authentication keys in localStorage
    const authToken = localStorage.getItem("gajuri-authToken");
    const userProfile = localStorage.getItem("chemiki-userProfile");

    // If either key is missing, redirect to login
    if (!authToken || !userProfile) {
      router.push("/login");
    }
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