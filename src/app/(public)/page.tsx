import { HeroSection } from '@/components/sections/hero-section';
import { ProjectsGrid } from '@/components/sections/projects-grid';
import { BlogPreview } from '@/components/sections/blog-preview';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProjectsGrid />
      <BlogPreview />
    </>
  );
}
