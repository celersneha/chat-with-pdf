"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import {
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Prevent background scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleNav = (hash: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    router.push(`/#${hash}`);
  };

  return (
    <>
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-[var(--color-secondary)]/20 bg-[var(--color-background)]/80 backdrop-blur fixed top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Image src="/logo.png" alt="Documind Logo" width={50} height={50} />
            <span className="text-2xl font-bold text-[var(--color-primary)] tracking-tight">
              Documind
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 text-[var(--color-secondary)] font-medium items-center">
          <a
            href="/#features"
            onClick={handleNav("features")}
            className="hover:text-[var(--color-accent)] transition"
          >
            Features
          </a>
          <a
            href="/#howitworks"
            onClick={handleNav("howitworks")}
            className="hover:text-[var(--color-accent)] transition"
          >
            How it Works
          </a>
          <a
            href="/#faq"
            onClick={handleNav("faq")}
            className="hover:text-[var(--color-accent)] transition"
          >
            FAQ
          </a>
          <SignedIn>
            <Link
              href="/chat"
              scroll={false}
              className="hover:text-[var(--color-accent)] transition"
            >
              Chat
            </Link>
          </SignedIn>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-2">
          <SignedOut>
            <SignInButton>
              <Button className="bg-[var(--color-accent)] hover:bg-[#c81e41] text-white px-5 py-2 rounded-lg shadow transition font-semibold">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <SignOutButton>
              <Button className="bg-[var(--color-accent)] hover:bg-[#c81e41] text-white px-5 py-2 rounded-lg shadow transition font-semibold">
                Sign Out
              </Button>
            </SignOutButton>
          </SignedIn>
        </div>

        {/* Hamburger Icon for Mobile */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded focus:outline-none z-[10000]"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className="block w-6 h-0.5 bg-[var(--color-primary)] mb-1"></span>
          <span className="block w-6 h-0.5 bg-[var(--color-primary)] mb-1"></span>
          <span className="block w-6 h-0.5 bg-[var(--color-primary)]"></span>
        </button>
      </header>

      {/* Mobile Fullscreen Menu with Animation */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed left-0 right-0 z-[9999] bg-[var(--color-background)] flex flex-col items-center justify-center"
            style={{
              top: "64px", // header height (adjust if header height changes)
              height: "calc(100vh - 64px)",
            }}
          >
            {/* Remove close button, only hamburger toggles */}
            <nav className="flex flex-col gap-8 text-2xl text-[var(--color-secondary)] font-semibold items-center">
              <a
                href="/#features"
                onClick={handleNav("features")}
                className="hover:text-[var(--color-accent)] transition"
              >
                Features
              </a>
              <a
                href="/#howitworks"
                onClick={handleNav("howitworks")}
                className="hover:text-[var(--color-accent)] transition"
              >
                How it Works
              </a>
              <a
                href="/#faq"
                onClick={handleNav("faq")}
                className="hover:text-[var(--color-accent)] transition"
              >
                FAQ
              </a>
              <SignedIn>
                <Link
                  href="/chat"
                  scroll={false}
                  className="hover:text-[var(--color-accent)] transition"
                  onClick={() => setMenuOpen(false)}
                >
                  Chat
                </Link>
              </SignedIn>
            </nav>
            <div className="mt-12 flex flex-col gap-4 w-full items-center">
              <SignedOut>
                <SignInButton>
                  <Button className="w-48 bg-[var(--color-accent)] hover:bg-[#c81e41] text-white px-5 py-3 rounded-lg shadow transition font-semibold text-lg">
                    Sign In
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <SignOutButton>
                  <Button className="w-48 bg-[var(--color-accent)] hover:bg-[#c81e41] text-white px-5 py-3 rounded-lg shadow transition font-semibold text-lg">
                    Sign Out
                  </Button>
                </SignOutButton>
              </SignedIn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
