//ThemeToggle
'use client'

import { Button } from "@heroui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes"
import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const {theme, setTheme} = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return(
    <Button
    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    isIconOnly
    variant="flat"
    color="default"
    >
      {theme === "dark" ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
    </Button>
  )
}