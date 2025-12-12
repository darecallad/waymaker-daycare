"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  const toggleLanguage = () => {
    setLocale(locale === "en" ? "zh" : "en");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 text-[#0F3B4C] hover:text-[#0F6C8C] hover:bg-white/20 transition-colors font-medium"
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">{locale === "en" ? "中文" : "English"}</span>
    </Button>
  );
}