'use client';

import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-20 lg:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl"
      >
        <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">Full Stack Developer</h1>
        <p className="mt-6 text-xl text-muted-foreground">
          Building fast, scalable, and user-friendly web applications.
        </p>
      </motion.div>
    </section>
  );
}
