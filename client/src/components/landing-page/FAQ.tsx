import React from "react";

export default function FAQSection() {
  return (
    <section id="faq" className="py-16 bg-[var(--color-background)]">
      <div className="w-1/2 mx-auto border-b-2 border-[#F43F5E] rounded-full mb-12 opacity-80" />
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-[var(--color-text)]">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <FAQ
            question="Is Documind free to use?"
            answer="Yes! You can get started for free. Some advanced features may require a subscription in the future."
          />
          <FAQ
            question="Are my documents secure?"
            answer="Absolutely. Your files are encrypted, processed securely, and never shared with third parties."
          />
          <FAQ
            question="Can I chat with multiple PDFs at once?"
            answer="Yes, you can select multiple documents to include in your chat context for richer, cross-document answers."
          />
          <FAQ
            question="Which AI model powers Documind?"
            answer="Documind uses advanced large language models for accurate and context-aware responses."
          />
        </div>
      </div>
    </section>
  );
}

function FAQ({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-[var(--color-surface)] rounded-lg shadow-sm border border-[var(--color-secondary)]/20 p-5">
      <div className="font-semibold mb-1 text-[var(--color-primary)]">
        {question}
      </div>
      <div className="text-[var(--color-secondary)]">{answer}</div>
    </div>
  );
}
