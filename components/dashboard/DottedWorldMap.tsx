"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import DottedMap from "dotted-map";

function getIsDarkTheme() {
  const root = document.documentElement;
  const explicitTheme = root.getAttribute("data-theme");

  if (explicitTheme === "dark") {
    return true;
  }

  if (explicitTheme === "light") {
    return false;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function DottedWorldMap() {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const syncTheme = () => {
      setIsDarkTheme(getIsDarkTheme());
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    mediaQuery.addEventListener("change", syncTheme);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", syncTheme);
    };
  }, []);

  const mapSvg = useMemo(() => {
    const map = new DottedMap({ height: 56, grid: "diagonal" });

    return map.getSVG({
      shape: "circle",
      backgroundColor: "transparent",
      radius: 0.2,
      color: isDarkTheme ? "#a1a1aa" : "#52525b",
    });
  }, [isDarkTheme]);

  return (
    <div className="app-panel p-4">
      <Image
        src={`data:image/svg+xml;utf8,${encodeURIComponent(mapSvg)}`}
        alt="Dotted world map"
        width={1200}
        height={420}
        unoptimized
        className="mt-3 h-auto w-full"
      />
    </div>
  );
}
