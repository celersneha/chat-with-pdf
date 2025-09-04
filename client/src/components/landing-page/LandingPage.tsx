import React from "react";
import Hero from "./Hero";
import Features from "./Features";
import HowItWorks from "./HowItWorks";
import FAQSection from "./FAQ";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] flex flex-col ">
      <Hero />
      <Features />
      <HowItWorks />
      <FAQSection />
    </main>
  );
}
