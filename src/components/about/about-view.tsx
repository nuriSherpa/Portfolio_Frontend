// src/components/about/about-view.tsx - NO 'use client'!
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils/image-url';
import {
  MapPin,
  Briefcase,
  BriefcaseBusiness,
  Mail,
  Award,
  Code2,
  Palette,
  Database,
  Server,
  ExternalLink,
  GraduationCap,
  BookOpen,
  BadgeCheck,
  User,
  FileUser,
} from 'lucide-react';
import { FiGithub } from 'react-icons/fi';
import { FaLinkedinIn } from 'react-icons/fa';
import { BsTwitterX } from 'react-icons/bs';
import { AboutData } from '@/lib/types/about';
import { AlumniDropdown } from './alumni-dropdown';
import { ScrollToTopButton } from '../shared/scroll-to-top-button';

interface AboutViewProps {
  about: AboutData;
}

// Helper functions (pure, no hooks needed)
function getDuration(startDate: string, endDate: string | null, current: boolean): string {
  const start = new Date(startDate);
  const end = current ? new Date() : new Date(endDate!);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);

  if (years > 0 && months > 0)
    return `${years} yr${years > 1 ? 's' : ''} ${months} mo${months > 1 ? 's' : ''}`;
  if (years > 0) return `${years} yr${years > 1 ? 's' : ''}`;
  return `${months} mo${months > 1 ? 's' : ''}`;
}

function groupSkillsByCategory(skills: AboutData['skills']) {
  return skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    },
    {} as Record<string, typeof skills>,
  );
}

// Reusable Logo Image Component with strict sizing
function LogoImage({
  src,
  alt,
  size = 'md',
}: {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'w-10 h-10 sm:w-12 sm:h-12',
    md: 'w-12 h-12 sm:w-14 sm:h-14',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
  };

  return (
    <div className={`relative flex-shrink-0 ${sizeClasses[size]}`}>
      <Image
        src={getImageUrl(src)}
        alt={alt}
        fill
        className="object-contain"
        sizes={size === 'sm' ? '48px' : '56px'}
      />
    </div>
  );
}

// Reusable Card Component
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white shadow-sm p-4 sm:p-5 md:p-6 ${className}`}>{children}</div>;
}

// Reusable Section Header
function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 sm:mb-4">
      <Icon size={18} className="sm:w-[20px] sm:h-[20px] text-red" />
      <h2 className="text-base sm:text-lg font-semibold text-grey-900">{title}</h2>
    </div>
  );
}

// Reusable Stat Item
function StatItem({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1">
      <Icon size={12} className="sm:w-[14px] sm:h-[14px] text-grey-400" />
      <span>{children}</span>
    </div>
  );
}

// Reusable Social Link
function SocialLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2.5 sm:p-3 border border-grey-200 text-grey-600 hover:border-red hover:text-red transition-all rounded-full hover:scale-110"
      aria-label={label}
    >
      <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
    </a>
  );
}

// Reusable Skill Tag
function SkillTag({ name, proficiency }: { name: string; proficiency: string }) {
  return (
    <div className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 bg-grey-100 rounded-full">
      <span className="text-xs sm:text-sm text-grey-700">{name}</span>
      <span className="text-[8px] sm:text-[10px] px-1 sm:px-2 py-0.5 rounded-full bg-grey-200 text-grey-600">
        {proficiency}
      </span>
    </div>
  );
}

// Reusable Language Tag
function LanguageTag({ name, proficiency }: { name: string; proficiency: string }) {
  const proficiencyColors: Record<string, string> = {
    basic: 'bg-grey-100 text-grey-600',
    conversational: 'bg-grey-100 text-grey-600',
    fluent: 'bg-grey-100 text-grey-600',
    native: 'bg-grey-100 text-grey-600 font-medium',
  };

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-grey-100 rounded-full">
      <span className="font-medium text-grey-700 text-xs sm:text-sm">{name}</span>
      <span
        className={`text-[8px] sm:text-[10px] px-1 sm:px-2 py-0.5 rounded-full ${proficiencyColors[proficiency] || 'bg-grey-100 text-grey-600'}`}
      >
        {proficiency}
      </span>
    </div>
  );
}

// Reusable Experience Item - No hover effect
function ExperienceItem({
  company,
  companyLogo,
  companyUrl,
  role,
  startDate,
  endDate,
  current,
  location,
}: {
  company: string;
  companyLogo?: string;
  companyUrl: string;
  role: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  location?: string;
}) {
  return (
    <div className="flex gap-3 sm:gap-4">
      {companyLogo && <LogoImage src={companyLogo} alt={company} size="md" />}
      <div className="flex-1 min-w-0">
        <a
          href={companyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-grey-900 text-sm sm:text-base line-clamp-1"
        >
          {company}
        </a>
        <p className="text-xs sm:text-sm text-grey-700 font-medium mt-0.5 line-clamp-1">{role}</p>
        <p className="text-xs text-grey-400 mt-1">
          {new Date(startDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
          })}{' '}
          -{' '}
          {current
            ? 'Present'
            : new Date(endDate!).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
              })}
          {' · '}
          {getDuration(startDate, endDate, current)}
        </p>
        {location && <p className="text-xs text-grey-400 mt-0.5">{location}</p>}
      </div>
    </div>
  );
}

// ✅ SERVER COMPONENT - Renders to static HTML
export function AboutView({ about }: AboutViewProps) {
  const skillsByCategory = groupSkillsByCategory(about.skills);

  const categoryIcons: Record<string, React.ReactNode> = {
    frontend: <Code2 size={18} className="text-grey-400" />,
    backend: <Server size={18} className="text-grey-400" />,
    database: <Database size={18} className="text-grey-400" />,
    devops: <Server size={18} className="text-grey-400" />,
    design: <Palette size={18} className="text-grey-400" />,
    mobile: <Code2 size={18} className="text-grey-400" />,
    other: <Code2 size={18} className="text-grey-400" />,
  };

  return (
    <div className="w-full pb-20">
      <div className="space-y-8 mt-12">
        {/* Banner + Profile Section */}
        <div className="bg-white shadow-sm">
          {about.bannerImage && (
            <div className="relative h-[150px] sm:h-[180px] md:h-[240px] lg:h-[280px] w-full">
              <Image
                src={getImageUrl(about.bannerImage)}
                alt={about.fullName}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
            </div>
          )}

          <div className="p-4 sm:p-5">
            <div className="flex flex-col md:flex-row gap-4 sm:gap-5 md:gap-6 lg:gap-8">
              {/* Profile Image */}
              <div className="flex justify-center md:justify-start flex-shrink-0">
                <div className="relative -mt-12 sm:-mt-14 md:-mt-16 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 rounded-full overflow-hidden bg-grey-100 border-4 border-white shadow-sm">
                  {about.profileImageUrl ? (
                    <Image
                      src={getImageUrl(about.profileImageUrl)}
                      alt={about.fullName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, (max-width: 1024px) 128px, 144px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-grey-100 text-grey-400 text-3xl sm:text-4xl">
                      {about.firstName?.[0]}
                      {about.lastName?.[0]}
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 sm:gap-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-grey-900">
                      {about.fullName}
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg font-medium text-red mt-1">
                      {about.jobTitle}
                    </p>
                    <p className="text-xs sm:text-sm md:text-base text-grey-600 mt-2 max-w-2xl leading-relaxed">
                      {about.headline}
                    </p>
                  </div>

                  {/* Social Icons + Alumni Container */}
                  {/* Social Icons + Alumni Container - Aligned Right */}
                  <div className="flex flex-col items-center md:items-end gap-3 mt-4 md:mt-0">
                    {/* Social Icons Row */}
                    {about.socialMediaLinks && Object.keys(about.socialMediaLinks).length > 0 && (
                      <div className="flex items-center justify-center md:justify-end gap-4 sm:gap-5">
                        {about.socialMediaLinks.github && (
                          <SocialLink
                            href={about.socialMediaLinks.github}
                            icon={FiGithub}
                            label="GitHub"
                          />
                        )}
                        {about.socialMediaLinks.linkedin && (
                          <SocialLink
                            href={about.socialMediaLinks.linkedin}
                            icon={FaLinkedinIn}
                            label="LinkedIn"
                          />
                        )}
                        {about.socialMediaLinks.twitter && (
                          <SocialLink
                            href={about.socialMediaLinks.twitter}
                            icon={BsTwitterX}
                            label="Twitter"
                          />
                        )}
                        {about.socialMediaLinks.email && (
                          <a
                            href={`mailto:${about.socialMediaLinks.email}`}
                            className="p-2.5 sm:p-3 border border-grey-200 text-grey-600 hover:border-red hover:text-red transition-all rounded-full hover:scale-110"
                          >
                            <Mail size={16} className="sm:w-[18px] sm:h-[18px]" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Alumni Dropdown - Below social icons with spacing */}
                    {about.alumniOf && about.alumniOf.length > 0 && (
                      <div className="mt-2">
                        <AlumniDropdown alumni={about.alumniOf} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 md:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm text-grey-600">
                  {about.location && (
                    <StatItem icon={MapPin}>
                      {about.location.city}, {about.location.country}
                    </StatItem>
                  )}
                  <StatItem icon={Briefcase}>{about.yearsOfExperience}+ years</StatItem>
                  <StatItem icon={Award}>{about.projectsCompleted} projects</StatItem>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 mt-6">
                  {about.availableForHire && (
                    <div className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red text-white rounded-lg font-medium w-full sm:w-auto sm:min-w-[180px]">
                      <BriefcaseBusiness className="w-4 h-4" />
                      Open to Work
                    </div>
                  )}
                  {about.resumeUrl && (
                    <a
                      href={about.resumeUrl}
                      download
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-black text-black hover:bg-red hover:text-white hover:border-red transition-colors rounded-lg font-medium w-full sm:w-auto sm:min-w-[180px]"
                    >
                      <FileUser className="w-4 h-4" />
                      Resume
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-4 sm:mt-5 md:mt-6 pt-4 sm:pt-5 md:pt-6 border-t border-grey-200">
              <SectionHeader icon={User} title="About" />
              <p className="text-grey-600 leading-relaxed whitespace-pre-line text-xs sm:text-sm md:text-base">
                {about.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Current Work */}
        {about.worksFor?.name && (
          <Card>
            <SectionHeader icon={Briefcase} title="Current Work" />
            <div className="flex items-center gap-3">
              {about.worksFor.logo && (
                <LogoImage src={about.worksFor.logo} alt={about.worksFor.name} size="md" />
              )}
              <div>
                <p className="text-xs sm:text-sm text-grey-400">Currently working at</p>
                <a
                  href={about.worksFor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-grey-900 hover:text-red inline-flex items-center gap-1 text-sm sm:text-base"
                >
                  {about.worksFor.name}
                  <ExternalLink size={10} className="sm:w-[12px] sm:h-[12px] text-grey-400" />
                </a>
              </div>
            </div>
          </Card>
        )}

        {/* Skills */}
        <Card>
          <SectionHeader icon={Code2} title="Skills" />
          <div className="space-y-3 sm:space-y-4">
            {Object.entries(skillsByCategory).map(([category, skills]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  {categoryIcons[category]}
                  <h3 className="font-medium text-grey-700 capitalize text-xs sm:text-sm md:text-base">
                    {category}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {skills.map((skill) => (
                    <SkillTag key={skill._id} name={skill.name} proficiency={skill.proficiency} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Experience Card - NO hover effects */}
        {about.experiences.length > 0 && (
          <Card>
            <SectionHeader icon={Briefcase} title="Experience" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {about.experiences.map((exp) => (
                <ExperienceItem
                  key={exp._id}
                  company={exp.company}
                  companyLogo={exp.companyLogo}
                  companyUrl={exp.companyUrl}
                  role={exp.role}
                  startDate={exp.startDate}
                  endDate={exp.endDate}
                  current={exp.current}
                  location={exp.location}
                />
              ))}
            </div>
          </Card>
        )}

        {/* Education Card */}
        {about.studies.length > 0 && (
          <Card>
            <SectionHeader icon={GraduationCap} title="Education" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {about.studies.map((study) => (
                <div key={study._id} className="flex gap-3 sm:gap-4">
                  {study.logo && <LogoImage src={study.logo} alt={study.institution} size="md" />}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-grey-900 text-sm sm:text-base line-clamp-1">
                      {study.institution}
                    </h3>
                    <p className="text-xs sm:text-sm text-grey-700 mt-0.5 line-clamp-2">
                      {study.degree}
                      {study.fieldOfStudy && ` in ${study.fieldOfStudy}`}
                    </p>
                    <p className="text-xs text-grey-400 mt-1">
                      {new Date(study.startDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                      })}{' '}
                      -{' '}
                      {study.current
                        ? 'Present'
                        : new Date(study.endDate!).toLocaleDateString('en-US', {
                            year: 'numeric',
                          })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Certifications Card */}
        {about.certifications.length > 0 && (
          <Card>
            <SectionHeader icon={BadgeCheck} title="Certifications" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
              {about.certifications.map((cert) => (
                <a
                  key={cert._id}
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-3 p-3 border border-grey-200 hover:border-red hover:shadow-sm transition-all rounded-sm w-full"
                >
                  {cert.logo && <LogoImage src={cert.logo} alt={cert.issuer} size="sm" />}
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <h3 className="font-medium text-grey-900 text-sm sm:text-base truncate">
                      {cert.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-grey-600 truncate">{cert.issuer}</p>
                    <p className="text-[10px] sm:text-xs text-grey-400 mt-1">
                      Issued{' '}
                      {new Date(cert.issueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                      })}
                      {cert.expiryDate && (
                        <>
                          {' · Expires '}
                          {new Date(cert.expiryDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                          })}
                        </>
                      )}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </Card>
        )}

        {/* Languages Card */}
        {about.languages.length > 0 && (
          <Card>
            <SectionHeader icon={BookOpen} title="Languages" />
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {about.languages.map((lang) => (
                <LanguageTag key={lang._id} name={lang.name} proficiency={lang.proficiency} />
              ))}
            </div>
          </Card>
        )}

        <ScrollToTopButton />
      </div>
    </div>
  );
}
