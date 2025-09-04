"use client";
import React from "react";
import Image from "next/image";
import { Github, Linkedin, Twitter, Mail, Coffee } from "lucide-react";

export default function Footer() {
  const socialLinks = [
    {
      name: "GitHub",
      icon: <Github className="w-4 h-4" />,
      href: "https://github.com/celersneha",
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="w-4 h-4" />,
      href: "https://www.linkedin.com/in/celersneha/",
    },
    {
      name: "Twitter",
      icon: <Twitter className="w-4 h-4" />,
      href: "https://twitter.com/celersneha",
    },
    {
      name: "Buy me a coffee",
      icon: <Coffee className="w-4 h-4" />,
      href: "https://buymeacoffee.com/celersneha",
    },
    {
      name: "Email",
      icon: <Mail className="w-4 h-4" />,
      href: "mailto:celersneha@gmail.com",
    },
  ];

  return (
    <footer className="relative bg-[var(--color-background)] py-8 px-4 border-t border-[var(--color-secondary)]/20 z-10 overflow-hidden">
      {/* Minimal memory lines with coral dots */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-end justify-center">
        <svg
          width="100%"
          height="100"
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-[100px]"
        >
          <path
            d="M80 60 Q 400 10 700 80 T 1360 60"
            stroke="#6a7584"
            strokeWidth="1.2"
            fill="none"
            opacity="0.14"
          />
          <path
            d="M200 90 Q 600 40 900 90 T 1300 40"
            stroke="#6a7584"
            strokeWidth="1"
            fill="none"
            opacity="0.10"
          />
          {/* Coral dots at intersections */}
          <circle cx="400" cy="25" r="5" fill="#F43F5E" opacity="0.85" />
          <circle cx="700" cy="80" r="4" fill="#F43F5E" opacity="0.85" />
          <circle cx="900" cy="90" r="4" fill="#F43F5E" opacity="0.85" />
          <circle cx="1300" cy="40" r="5" fill="#F43F5E" opacity="0.85" />
          <circle cx="1360" cy="60" r="5" fill="#F43F5E" opacity="0.85" />
        </svg>
      </div>
      {/* Footer Content */}
      <div className="relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
            {/* Social Links */}
            <div className="flex flex-col items-center order-2 md:order-1 mt-8 md:mt-0">
              <div className="flex space-x-3 mb-4">
                {socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-[var(--color-surface)] hover:bg-[var(--color-accent)] rounded-full transition-all duration-200 hover:scale-110 text-[var(--color-primary)] hover:text-white"
                    aria-label={link.name}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
            {/* Logo and tagline */}
            <div className="order-1 md:order-2">
              <div className="flex flex-col items-center space-y-2 mb-2 md:mb-0">
                <Image
                  src="/logo.png"
                  alt="Documind Logo"
                  width={48}
                  height={48}
                  className="w-12 h-12 sm:w-20 sm:h-20 mb-1"
                />
                <span className="text-[var(--color-secondary)] text-xs">
                  Chat with your PDFs using AI.
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Copyright */}
        <div className="text-center text-[var(--color-secondary)] text-xs pt-3">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            <span className="text-[var(--color-primary)] font-semibold">
              Documind
            </span>
            . All rights reserved.
          </p>
          <p className="mt-1 text-[var(--color-accent)] font-medium">
            Built for smarter document conversations.
          </p>
        </div>
      </div>
    </footer>
  );
}
