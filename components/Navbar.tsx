'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo e nome */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <Image 
              src="/images/logos/PSG_LOGO.svg" 
              alt="Logo" 
              width={40} 
              height={40}
              className="rounded-full"
            />
            <span className="font-bold text-xl">A.S.D. Patrocinio San Giuseppe</span>
          </Link>

          {/* Menu Desktop con shadcn NavigationMenu */}
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Home
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link href="/chi-siamo" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Chi Siamo
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link href="/gazzettino" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Gazzettino
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link href="/gallery" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Gallery
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link href="/campionato" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Campionato
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Hamburger Menu Mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Menu Mobile */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/" className="block py-2 px-4 hover:bg-gray-100 rounded transition">
              Home
            </Link>
            <Link href="/chi-siamo" className="block py-2 px-4 hover:bg-gray-100 rounded transition">
              Chi Siamo
            </Link>
            <Link href="/gazzettino" className="block py-2 px-4 hover:bg-gray-100 rounded transition">
              Gazzettino
            </Link>
            <Link href="/gallery" className="block py-2 px-4 hover:bg-gray-100 rounded transition">
              Gallery
            </Link>
            <Link href="/campionato" className="block py-2 px-4 hover:bg-gray-100 rounded transition">
              Campionato
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}