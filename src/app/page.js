"use client";

import { usePathname, notFound } from "next/navigation";
import { useEffect } from "react";
import HomeContent from "./components/HomeContent";

export default function Page() {
  const pathname = usePathname();

  useEffect(() => {
    // If we are on an invalid URL, trigger the Next.js notFound UI
    if (pathname !== "/") {
      notFound();
    }
  }, [pathname]);

  // Only render HomeContent if the path is exactly "/"
  if (pathname !== "/") {
    return null;
  }

  return <HomeContent />;
}