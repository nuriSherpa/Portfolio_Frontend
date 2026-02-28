'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Home, FolderKanban, BookOpen, User } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/blog', label: 'Blog', icon: BookOpen },
  { href: '/about', label: 'About', icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const getActivePage = () => {
    const exactMatch = navItems.find((item) => pathname === item.href);
    if (exactMatch) return exactMatch;
    const startsWithMatch = navItems.find(
      (item) => item.href !== '/' && pathname.startsWith(item.href + '/'),
    );
    return startsWithMatch || navItems[0];
  };

  const activePage = getActivePage();

  const isItemActive = (itemHref: string) => {
    if (itemHref === '/') {
      return pathname === '/';
    }
    return pathname === itemHref || pathname.startsWith(itemHref + '/');
  };

  return (
    <>
      {/* Desktop Navbar - 80% width */}
      <header className="sticky top-0 z-50 w-full border-b border-grey-200 bg-white hidden md:block">
        <nav className="w-[80%] mx-auto flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-black hover:text-red transition-colors">
            XD
          </Link>

          <ul className="flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.href);
              const isHovered = hoveredItem === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group relative flex items-center justify-center w-20 h-10"
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div
                      className={cn(
                        'absolute inset-0 flex items-center justify-center transition-all duration-300',
                        isActive || isHovered
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-90 -translate-y-1',
                      )}
                    >
                      <Icon
                        size={20}
                        className={cn(
                          'transition-colors',
                          isActive ? 'text-red' : 'text-grey-600 group-hover:text-red',
                        )}
                      />
                    </div>

                    <div
                      className={cn(
                        'absolute inset-0 flex items-center justify-center transition-all duration-300',
                        !isActive && !isHovered
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-90 translate-y-1',
                      )}
                    >
                      <span className="text-sm font-medium text-grey-600 group-hover:text-red">
                        {item.label}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      {/* Mobile Floating Navigation - stays fixed */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <div className="relative">
          {isOpen && (
            <div className="absolute bottom-14 right-0 flex flex-col items-end gap-2 mb-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item.href);
                if (isActive) return null;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 bg-white px-4 py-3 rounded-full shadow-lg border border-grey-200 hover:bg-grey-100 transition-all duration-200"
                  >
                    <Icon size={18} className="text-grey-600" />
                    <span className="text-sm font-medium text-grey-700">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'flex items-center justify-center h-14 w-14 rounded-full shadow-lg transition-all duration-300',
              isOpen ? 'bg-red' : 'bg-red hover:bg-red/90',
            )}
          >
            <div className="relative w-full h-full">
              <span
                className={cn(
                  'absolute inset-0 flex items-center justify-center text-white font-bold text-lg transition-all duration-300',
                  isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0',
                )}
              >
                XD
              </span>

              <div
                className={cn(
                  'absolute inset-0 flex items-center justify-center transition-all duration-300',
                  isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100',
                )}
              >
                {(() => {
                  const Icon = activePage.icon;
                  return <Icon size={24} className="text-white" />;
                })()}
              </div>
            </div>
          </button>

          {!isOpen && (
            <div className="absolute -top-2 -left-2 bg-white px-3 py-1 rounded-full text-xs font-medium shadow border border-grey-200 min-w-[70px] text-center transition-all duration-300">
              {activePage.label}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
