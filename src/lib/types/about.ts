// src/lib/types/about.ts
export interface Location {
  city: string;
  country: string;
  region: string;
}

export interface WorksFor {
  name: string;
  url: string;
  logo: string;
}

export interface SocialMediaLinks {
  linkedin: string;
  github: string;
  twitter: string;
  facebook: string;
  instagram: string;
  email: string;
  website: string;
}

export interface AlumniOf {
  name: string;
  url: string;
  _id: string;
  id: string;
}

export interface Study {
  institution: string;
  institutionUrl: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  logo: string;
  _id: string;
  id: string;
}

export interface Skill {
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'design';
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  _id: string;
  id: string;
}

export interface Experience {
  company: string;
  companyUrl: string;
  companyLogo: string;
  role: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  location: string;
  description: string;
  achievements: string[];
  technologies: string[];
  _id: string;
  id: string;
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string | null;
  url: string;
  logo: string;
  _id: string;
  id: string;
}

export interface Language {
  name: string;
  proficiency: 'native' | 'fluent' | 'conversational' | 'basic';
  _id: string;
  id: string;
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  name: string;
  givenName: string;
  familyName: string;
  jobTitle: string;
  description: string;
  url: string;
  image: string;
  sameAs: string[];
  knowsAbout: string[];
  address: {
    '@type': string;
    addressLocality: string;
    addressCountry: string;
    addressRegion: string;
  };
  worksFor: {
    '@type': string;
    name: string;
    url: string;
  };
  alumniOf: Array<{
    '@type': string;
    name: string;
    url: string;
  }>;
  knowsLanguage: Array<{
    '@type': string;
    name: string;
    proficiencyLevel: string;
  }>;
}

export interface BreadcrumbSchema {
  '@context': string;
  '@type': string;
  itemListElement: Array<{
    '@type': string;
    position: number;
    name: string;
    item: string;
  }>;
}

export interface OgData {
  title: string;
  description: string;
  image: string;
  type: string;
  url: string;
  profile: {
    first_name: string;
    last_name: string;
  };
}

export interface Stats {
  yearsOfExperience: number;
  educationCount: number;
  certificationCount: number;
  skillCount: number;
  projectCount: number;
}

export interface AboutData {
  location: Location;
  worksFor: WorksFor;
  socialMediaLinks: SocialMediaLinks;
  _id: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  fullName: string;
  firstName: string;
  lastName: string;
  title: string;
  headline: string;
  profileImageUrl: string;
  ogImage: string;
  bannerImage: string;
  bio: string;
  shortBio: string;
  jobTitle: string;
  alumniOf: AlumniOf[];
  knowsAbout: string[];
  studies: Study[];
  skills: Skill[];
  experiences: Experience[];
  certifications: Certification[];
  languages: Language[];
  resumeUrl: string;
  resumeLastUpdated: string;
  availableForHire: boolean;
  availabilityStatus: string;
  yearsOfExperience: number;
  projectsCompleted: number;
  happyClients: number;
  profileLastUpdated: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  canonicalUrl: string;
  structuredData: StructuredData;
  breadcrumbSchema: BreadcrumbSchema;
  ogData: OgData;
  stats: Stats;
  id: string;
}
