"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DaycareTourManager from "@/components/admin/DaycareTourManager";
import AuditLogPanel from "@/components/admin/AuditLogPanel";
import type { TourSettings, UserRole } from "@/lib/types";
import { Building2, CalendarCheck, Loader2, LogOut, ShieldCheck } from "lucide-react";

type ManagedDaycare = TourSettings & { upcomingBookings: number };

/**
 * Daycare tour management dashboard.
 *
 * Only allowlisted administrators can reach this page; each of them can manage every
 * daycare, so the location switcher lists all partners.
 */
export default function AdminDashboardPage() {
  const router = useRouter();
  const [daycares, setDaycares] = useState<ManagedDaycare[]>([]);
  const [activeSlug, setActiveSlug] = useState("");
  const [role, setRole] = useState<UserRole>("admin");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [logVersion, setLogVersion] = useState(0);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/daycares");

      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Could not load your daycares.");
        return;
      }

      setRole(result.role);
      setEmail(result.email);
      setDaycares(result.daycares);
      setActiveSlug((current) =>
        current && result.daycares.some((d: ManagedDaycare) => d.slug === current)
          ? current
          : result.daycares[0]?.slug ?? ""
      );
    } catch {
      setError("Network error. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  /**
   * Merge the settings returned by a mutation back into local state so the UI reflects the
   * change without a full reload.
   */
  const handleUpdated = (updated: TourSettings) => {
    setDaycares((current) =>
      current.map((daycare) =>
        daycare.slug === updated.slug ? { ...daycare, ...updated } : daycare
      )
    );
    // Surface the entry this change just wrote
    setLogVersion((version) => version + 1);
  };

  const active = daycares.find((daycare) => daycare.slug === activeSlug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F3B4C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      <div className="bg-[#0F3B4C] text-white pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-[#73BBD1] text-sm font-medium mb-4">
                {role === "super_admin" ? (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Super Admin
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4" /> Administrator
                  </>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold">Tour Management</h1>
              <p className="text-gray-300 mt-2">{email}</p>
            </div>

            <Button
              type="button"
              onClick={logout}
              variant="outline"
              className="rounded-xl h-11 bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl -mt-12 relative z-10 space-y-8">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
            {error}
          </div>
        )}

        {daycares.length === 0 && !error ? (
          <div className="bg-white rounded-3xl shadow-xl p-10 text-center text-gray-500">
            No daycares are linked to this account yet.
          </div>
        ) : (
          <>
            {daycares.length > 1 && (
              <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6">
                <h2 className="text-sm font-medium text-gray-700 mb-4">Select a location</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {daycares.map((daycare) => (
                    <button
                      key={daycare.slug}
                      type="button"
                      onClick={() => setActiveSlug(daycare.slug)}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all",
                        daycare.slug === activeSlug
                          ? "bg-[#0F3B4C] border-[#0F3B4C] text-white shadow-lg"
                          : "bg-white border-gray-100 text-gray-700 hover:border-[#73BBD1]"
                      )}
                    >
                      <span className="block font-bold">{daycare.name}</span>
                      <span
                        className={cn(
                          "text-xs",
                          daycare.slug === activeSlug ? "text-[#73BBD1]" : "text-gray-400"
                        )}
                      >
                        {daycare.upcomingBookings} upcoming tour(s)
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {active && (
              <>
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 flex flex-wrap items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#A8D5BA]/20 flex items-center justify-center text-[#5da87b]">
                    <CalendarCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-[#0F3B4C]">{active.name}</h2>
                    <p className="text-sm text-gray-500">
                      Current hours: {active.tourHours || "None set"}
                    </p>
                  </div>
                  <div className="ml-auto text-right text-sm text-gray-500">
                    <p>{active.upcomingBookings} upcoming tour(s)</p>
                    {active.updatedAt && (
                      <p className="text-xs text-gray-400">
                        Last updated {new Date(active.updatedAt).toLocaleString()} by {active.updatedBy}
                      </p>
                    )}
                  </div>
                </div>

                <DaycareTourManager
                  key={active.slug}
                  settings={active}
                  role={role}
                  onUpdated={handleUpdated}
                />

                <AuditLogPanel slug={active.slug} role={role} refreshToken={logVersion} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
