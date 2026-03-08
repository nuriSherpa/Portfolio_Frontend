'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const footerLinks = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
];

const socialLinks = [
  { href: 'https://github.com', label: 'GitHub' },
  { href: 'https://linkedin.com', label: 'LinkedIn' },
  { href: 'https://twitter.com', label: 'Twitter' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  const normalizePath = (path: string) => {
    if (path === '/') return '/';
    return path.replace(/\/$/, '');
  };

  const currentPath = normalizePath(pathname);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const normalizedHref = normalizePath(href);
    if (currentPath === normalizedHref) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="border-t border-grey-200 bg-white w-full">
      {/* 80% width container - matches RootLayout exactly */}
      <div className="w-[80%] max-w-6xl mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              href="/"
              onClick={(e) => handleNavClick(e, '/')}
              className="text-lg font-bold text-black hover:text-red transition-colors"
            >
              XD
            </Link>
            <p className="text-sm text-grey-600 max-w-xs">
              Full-stack developer building fast, scalable web applications.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-black uppercase tracking-wider">
              Navigation
            </h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="text-sm text-grey-600 hover:text-red transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-black uppercase tracking-wider">Connect</h3>
            <ul className="space-y-2">
              {socialLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-grey-600 hover:text-red transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-grey-200 flex flex-col md:flex-row justify-center items-center gap-4">
          <p className="text-sm text-grey-600">{currentYear} XD. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
