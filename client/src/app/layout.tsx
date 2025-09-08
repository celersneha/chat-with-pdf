import type { Metadata } from "next";
import { ClerkProvider, SignedOut, SignedIn } from "@clerk/nextjs";
import "./globals.css";
import RegisterUserOnSignIn from "@/components/RegisterUserOnSignIn";
import { Toaster } from "sonner";
import Header from "@/components/custom-components/Header";
import Footer from "@/components/custom-components/Footer";
import LandingPage from "@/components/landing-page/LandingPage";
import Loading from "@/components/custom-components/Loading";
import RouteLoadingIndicator from "@/components/custom-components/RouteLoadingIndicator";

export const metadata: Metadata = {
  title: "pdfiq",
  description: "Chat with your PDFs using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin=""
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="antialiased">
          <RouteLoadingIndicator />
          {/* Signed-out users see the landing page */}
          <SignedOut>
            <Header />
            <LandingPage />
            <Footer />
          </SignedOut>
          {/* Signed-in users see the app */}
          <SignedIn>
            <Header />
            <RegisterUserOnSignIn />
            <Toaster />
            <main>{children}</main>
            <Footer />
          </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  );
}
