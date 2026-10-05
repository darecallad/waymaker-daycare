"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  const toggleLanguage = () => {
    setLocale(locale === "en" ? "zh" : "en");
  };

  const switchingToChinese = locale === "en";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      aria-label={switchingToChinese ? "Switch to Chinese 切換至中文" : "Switch to English 切換至英文"}
      className="flex min-h-11 items-center gap-2 text-[#0F3B4C] hover:text-[#0F6C8C] hover:bg-white/20 transition-colors font-medium"
    >
      <Globe aria-hidden="true" className="h-4 w-4" />
      <span lang={switchingToChinese ? "zh-Hant" : "en"} className="font-medium">
        {switchingToChinese ? "中文" : "English"}
      </span>
    </Button>
  );
}