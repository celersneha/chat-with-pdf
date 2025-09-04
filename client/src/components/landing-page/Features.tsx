import React from "react";
import { MessageCircle, Search, Lock, Users } from "lucide-react";

export default function Features() {
  return (
    <section className="py-16 bg-[var(--color-background)]">
      <div className="w-1/2 mx-auto border-b-2 border-[#F43F5E] rounded-full mb-12 opacity-80" />
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-[var(--color-text)]">
          Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <FeatureCard
            icon={
              <MessageCircle className="text-[var(--color-accent)]" size={32} />
            }
            title="Conversational AI"
            desc="Ask questions and get instant, context-aware answers from your PDFs."
          />
          <FeatureCard
            icon={<Search className="text-[var(--color-accent)]" size={32} />}
            title="Semantic Search"
            desc="Find information across multiple documents using smart vector search."
          />
          <FeatureCard
            icon={<Lock className="text-[var(--color-accent)]" size={32} />}
            title="Private & Secure"
            desc="Your documents and chats are encrypted and never shared."
          />
          <FeatureCard
            icon={<Users className="text-[var(--color-accent)]" size={32} />}
            title="Multi-File Context"
            desc="Select and chat with multiple PDFs at once for richer insights."
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center bg-[var(--color-surface)] rounded-2xl shadow-lg px-8 py-8 border border-[var(--color-secondary)]/15 transition-transform hover:shadow-2xl hover:border-[var(--color-accent)]/40 group">
      <div className="mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-accent)]/10 group-hover:bg-[var(--color-accent)]/20 transition">
        {icon}
      </div>
      <div className="font-semibold mb-2 text-lg text-[var(--color-primary)] group-hover:text-[var(--color-accent)] transition-colors">
        {title}
      </div>
      <div className="text-[var(--color-secondary)] text-sm text-center">
        {desc}
      </div>
    </div>
  );
}
