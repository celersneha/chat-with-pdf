import React from "react";

export default function HowItWorks() {
  return (
    <section id="howitworks" className="bg-[var(--color-background)] py-16">
      <div className="w-1/2 mx-auto border-b-2 border-[#F43F5E] rounded-full mb-12 opacity-80" />
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center text-[var(--color-text)]">
          How DocQ Works
        </h2>
        <ol className="space-y-8 text-left">
          <li className="flex items-start gap-4">
            <span className="bg-[var(--color-accent)] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
              1
            </span>
            <div>
              <span className="font-semibold text-[var(--color-primary)]">
                Upload your PDF(s)
              </span>
              <p className="text-[var(--color-secondary)]">
                Drag and drop or select one or more PDF files to get started.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span className="bg-[var(--color-accent)] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
              2
            </span>
            <div>
              <span className="font-semibold text-[var(--color-primary)]">
                Select Context
              </span>
              <p className="text-[var(--color-secondary)]">
                Choose which documents to include in your chat context for
                precise answers.
              </p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span className="bg-[var(--color-accent)] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
              3
            </span>
            <div>
              <span className="font-semibold text-[var(--color-primary)]">
                Chat & Explore
              </span>
              <p className="text-[var(--color-secondary)]">
                Ask questions, get summaries, and discover insights instantly
                with AI.
              </p>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}
