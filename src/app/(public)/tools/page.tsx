// src/app/(public)/tools/page.tsx
// Just a placeholder page for now. We can expand this later with actual tools and content.

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tools | Portfolio',
  description: 'Explore the tools and technologies I use in my projects and development workflow.',
};

export default function ToolsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Tools</h1>
      <p className="text-lg text-gray-700">
        This is a placeholder page for tools. Here, I will showcase the various tools and
        technologies I use in my projects and development workflow. Stay tuned for updates!
      </p>
    </div>
  );
}
