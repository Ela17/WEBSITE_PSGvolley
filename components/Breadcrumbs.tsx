"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Non mostrare breadcrumbs sulla homepage
  if (pathname === "/") return null;

  // Mappa per i nomi delle pagine
  const pathNames: Record<string, string> = {
    "chi-siamo": "Chi Siamo",
    gazzettino: "Il Gazzettino",
    gallery: "Gallery",
    campionato: "Campionato",
    eventi: "Eventi",
  };

  // Divide il path in segmenti
  const pathSegments = pathname.split("/").filter((segment) => segment);

  return (
    <div className="bg-gray-50 border-b">
      <div className="container mx-auto px-4 py-2">
        <Breadcrumb>
          <BreadcrumbList>
            {/* Home link */}
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center gap-1">
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {/* Path segments */}
            {pathSegments.map((segment, index) => {
              const href = "/" + pathSegments.slice(0, index + 1).join("/");
              const isLast = index === pathSegments.length - 1;
              const label = pathNames[segment] || segment;

              return (
                <React.Fragment key={href}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={href}>{label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
