// src/components/projects/project-card.tsx
'use client';

import { memo, useState, useEffect, useRef } from 'react';
import { Project } from '@/lib/types/models';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { imageCache, getBlurPlaceholder } from '@/lib/utils/image-loader';

interface ProjectCardProps {
  project: Project;
  priority?: boolean;
}

const fixUrl = (url: string | undefined): string => {
  if (!url || url === 'undefined' || url === 'null' || url === '') return '';
  return url.replace(/&#x2F;/g, '/').replace(/&amp;/g, '&');
};

export const ProjectCard = memo(function ProjectCard({
  project,
  priority = false,
}: ProjectCardProps) {
  const [imageSrc, setImageSrc] = useState<string>(getBlurPlaceholder());
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const imageUrl = fixUrl(project.projectImage);
  const hasImage = imageUrl.length > 0;

  const techs = (project.technologies || []).slice(0, 3);
  const remaining = (project.technologies || []).length - 3;
  const status = project.projectStatus || 'planning';

  // For priority images (first 3), load immediately
  useEffect(() => {
    if (priority && hasImage) {
      // Check cache first
      if (imageCache.has(imageUrl)) {
        setImageSrc(imageUrl);
        setIsLoaded(true);
      } else {
        // Load and cache
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
          imageCache.set(imageUrl);
          setImageSrc(imageUrl);
          setIsLoaded(true);
        };
      }
    }
  }, [priority, imageUrl, hasImage]);

  // Intersection Observer for non-priority images
  useEffect(() => {
    if (!cardRef.current || priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '200px', // Start loading 200px before visible
        threshold: 0.01,
      },
    );

    observer.observe(cardRef.current);

    return () => observer.disconnect();
  }, [priority]);

  // Load image when in view
  useEffect(() => {
    if (!isInView || priority || !hasImage || isLoaded) return;

    // Check cache first
    if (imageCache.has(imageUrl)) {
      setImageSrc(imageUrl);
      setIsLoaded(true);
      return;
    }

    // Load new image
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      imageCache.set(imageUrl);
      setImageSrc(imageUrl);
      setIsLoaded(true);
    };
  }, [isInView, imageUrl, hasImage, priority, isLoaded]);

  // Handle image load event
  const handleImageLoad = () => {
    setIsLoaded(true);
    imageCache.markAsLoaded(imageUrl);
  };

  return (
    <div
      ref={cardRef}
      className="group bg-white border border-grey-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full"
      style={{
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        willChange: 'transform',
      }}
    >
      {/* Image Container - Fixed aspect ratio */}
      <div className="relative w-full overflow-hidden bg-grey-100" style={{ aspectRatio: '16/9' }}>
        {/* Status Badge */}
        <div className="absolute top-3 left-3 z-20">
          <span className="bg-red text-white text-xs px-2 py-1 rounded-full capitalize shadow-sm">
            {status.replace('-', ' ')}
          </span>
        </div>

        <Link href={`/projects/${project.slug || '#'}`} className="block w-full h-full">
          {hasImage ? (
            <>
              {/* Blur placeholder while loading */}
              <img
                ref={imgRef}
                src={isLoaded ? imageUrl : imageSrc}
                alt={project.title || 'Project'}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  isLoaded ? 'opacity-100 scale-100' : 'opacity-50 scale-105'
                }`}
                style={{
                  filter: isLoaded ? 'none' : 'blur(5px)',
                }}
                onLoad={handleImageLoad}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
              />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-grey-100 to-grey-200" />
          )}
        </Link>

        {/* External link - only show after image is loaded */}
        {project.liveUrl && isLoaded && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 right-3 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 shadow-md"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={16} className="text-grey-700" />
          </a>
        )}
      </div>

      {/* Content - Fixed height to prevent layout shift */}
      <div className="p-5">
        <Link href={`/projects/${project.slug || '#'}`}>
          <h3 className="font-semibold text-black group-hover:text-red transition-colors line-clamp-1 mb-2">
            {project.title || 'Untitled'}
          </h3>
        </Link>

        <p className="text-sm text-grey-600 line-clamp-2 mb-4 min-h-[2.5rem]">
          {project.excerpt || 'No description'}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {techs.map((tech, i) => (
            <span key={i} className="text-xs px-2 py-1 bg-grey-100 rounded-full text-grey-700">
              {tech.name}
            </span>
          ))}
          {remaining > 0 && (
            <span className="text-xs px-2 py-1 bg-red/10 text-red rounded-full font-medium">
              +{remaining}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
