import React from "react";
import Link from "next/link";
import { Button } from "../ui/button";

export default function Hero() {
  return (
    <section className="relative flex flex-1 flex-col items-center justify-center text-center px-4 py-16 min-h-screen bg-[var(--color-background)] overflow-hidden mt-10">
      {/* Flowing memory lines with coral dots */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-0 top-0 w-full h-full"
        >
          {/* Memory lines */}
          <path
            d="M100 200 Q 400 100 700 300 T 1300 250"
            stroke="#6a7584"
            strokeWidth="1.5"
            fill="none"
            opacity="0.18"
          />
          <path
            d="M200 400 Q 600 600 900 350 T 1350 600"
            stroke="#6a7584"
            strokeWidth="1.2"
            fill="none"
            opacity="0.13"
          />
          <path
            d="M150 600 Q 500 500 800 700 T 1200 650"
            stroke="#6a7584"
            strokeWidth="1"
            fill="none"
            opacity="0.10"
          />
          {/* Coral dots at intersections */}
          <circle cx="400" cy="150" r="7" fill="#F43F5E" opacity="0.85" />
          <circle cx="700" cy="300" r="6" fill="#F43F5E" opacity="0.85" />
          <circle cx="900" cy="350" r="5" fill="#F43F5E" opacity="0.85" />
          <circle cx="800" cy="700" r="6" fill="#F43F5E" opacity="0.85" />
          <circle cx="1200" cy="650" r="5" fill="#F43F5E" opacity="0.85" />
          <circle cx="1300" cy="250" r="6" fill="#F43F5E" opacity="0.85" />
          <circle cx="1350" cy="600" r="7" fill="#F43F5E" opacity="0.85" />
        </svg>
      </div>
      {/* Light doc and chat overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-0">
        {/* Document Icon */}
        <svg
          width="320"
          height="400"
          viewBox="0 0 320 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10"
          style={{ filter: "blur(1px)" }}
        >
          <rect
            x="40"
            y="40"
            width="200"
            height="280"
            rx="24"
            fill="#fff"
            stroke="#6a7584"
            strokeWidth="4"
          />
          <rect
            x="60"
            y="80"
            width="160"
            height="16"
            rx="8"
            fill="#6a7584"
            opacity="0.2"
          />
          <rect
            x="60"
            y="120"
            width="120"
            height="12"
            rx="6"
            fill="#6a7584"
            opacity="0.15"
          />
          <rect
            x="60"
            y="150"
            width="140"
            height="12"
            rx="6"
            fill="#6a7584"
            opacity="0.12"
          />
          <rect
            x="60"
            y="180"
            width="100"
            height="12"
            rx="6"
            fill="#6a7584"
            opacity="0.1"
          />
        </svg>
        {/* Chat Bubble Icon */}
        <svg
          width="180"
          height="120"
          viewBox="0 0 180 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-[60%] top-[65%] opacity-10"
        >
          <rect
            x="10"
            y="20"
            width="140"
            height="60"
            rx="20"
            fill="#f43f5e"
            opacity="0.12"
          />
          <ellipse
            cx="60"
            cy="50"
            rx="10"
            ry="6"
            fill="#f43f5e"
            opacity="0.18"
          />
          <ellipse
            cx="90"
            cy="50"
            rx="10"
            ry="6"
            fill="#f43f5e"
            opacity="0.18"
          />
          <ellipse
            cx="120"
            cy="50"
            rx="10"
            ry="6"
            fill="#f43f5e"
            opacity="0.18"
          />
          <polygon points="60,80 80,80 70,100" fill="#f43f5e" opacity="0.12" />
        </svg>
      </div>
      <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-[var(--color-text)] relative z-10">
        Chat with your{" "}
        <span className="text-[var(--color-accent)] hover:text-[#f43f5e] transition-colors">
          PDFs
        </span>{" "}
        using{" "}
        <span className="text-[var(--color-accent)] hover:text-[#f43f5e] transition-colors">
          AI
        </span>
      </h1>
      <p className="text-lg md:text-2xl text-[var(--color-secondary)] max-w-2xl mb-8 relative z-10">
        DocQ lets you upload, search, and converse with your documents. Get
        instant answers, summaries, and insights from your PDFs, all in a
        beautiful, secure, and intuitive interface.
      </p>
      <Link href="/sign-up" className="relative z-10">
        <Button className="bg-[var(--color-accent)] hover:bg-[#f43f5e] text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-lg transition">
          Get Started for Free
        </Button>
      </Link>
    </section>
  );
}
