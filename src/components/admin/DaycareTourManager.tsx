"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { DAY_NAMES, generateAvailableSlots, isValidTimeRange } from "@/lib/tour-slots";
import type { TourSettings, UserRole, WeeklyTourSchedule } from "@/lib/types";
import { AlertTriangle, CalendarOff, Check, Clock, Loader2, Plus, Trash2, X } from "lucide-react";

/** A booking that a pending change would break. */
interface ConflictBooking {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
}

/** The change that is waiting for the owner to confirm how conflicts are handled. */
interface PendingAction {
  kind: "schedule" | "block";
  conflicts: ConflictBooking[];
  message: string;
  submit: (options: { force: boolean; cancelConflicts: boolean; reason?: string }) => Promise<void>;
}

interface Props {
  settings: TourSettings;
  role: UserRole;
  onUpdated: (settings: TourSettings) => void;
}

const DEFAULT_TIME = "10:00 AM";

/**
 * Editor for one daycare: weekly tour hours + closed dates.
 *
 * Every mutation is attempted without `force` first; the API answers 409 with the affected
 * bookings, which are surfaced in a confirmation panel so nobody's tour disappears silently.
 */
export default function DaycareTourManager({ settings, role, onUpdated }: Props) {
  const [weekly, setWeekly] = useState<WeeklyTourSchedule[]>(settings.weeklySchedule);
  const [newDate, setNewDate] = useState("");
  const [newDateEnd, setNewDateEnd] = useState("");
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [busy, setBusy] = useState<"schedule" | "block" | "unblock" | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Re-sync the editor when the parent hands over a different location. Deliberately keyed on
  // the slug, not the settings object: a successful save produces a new object identity, and
  // resetting here would wipe the success banner - including its "N parents could not be
  // emailed" warnings - in the very next render.
  useEffect(() => {
    setWeekly(settings.weeklySchedule);
    setError("");
    setSuccess("");
    setPending(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.slug]);

  const timeByDay = useMemo(() => {
    const map = new Map<number, string>();
    weekly.forEach((entry) => map.set(entry.day, entry.time));
    return map;
  }, [weekly]);

  const previewSlots = useMemo(
    () =>
      generateAvailableSlots({
        tourHours: weekly
          .slice()
          .sort((a, b) => a.day - b.day)
          .map((entry) => `${DAY_NAMES[entry.day]} ${entry.time}`)
          .join(" | "),
        blockedDates: settings.blockedDates,
      }),
    [weekly, settings.blockedDates]
  );

  const toggleDay = (day: number) => {
    setWeekly((current) =>
      current.some((entry) => entry.day === day)
        ? current.filter((entry) => entry.day !== day)
        : [...current, { day, time: DEFAULT_TIME }]
    );
  };

  const setDayTime = (day: number, time: string) => {
    setWeekly((current) => current.map((entry) => (entry.day === day ? { ...entry, time } : entry)));
  };

  /**
   * Send a mutation and translate a 409 into a confirmation prompt.
   *
   * @param url - Endpoint
   * @param method - HTTP verb
   * @param payload - Request body (merged with the force flags)
   * @param successMessage - Message shown when the change goes through
   * @param kind - Which panel is busy / which conflict copy to show
   */
  const submit = async (
    url: string,
    method: "PUT" | "POST" | "DELETE",
    payload: Record<string, unknown>,
    successMessage: string,
    kind: "schedule" | "block" | "unblock"
  ) => {
    setBusy(kind);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (response.status === 409 && result.error === "CONFLICTING_BOOKINGS") {
        setPending({
          kind: kind === "schedule" ? "schedule" : "block",
          conflicts: result.conflicts ?? [],
          message: result.message ?? "Existing bookings conflict with this change.",
          submit: async ({ force, cancelConflicts, reason: cancelReason }) => {
            await submit(
              url,
              method,
              { ...payload, force, cancelConflicts, reason: cancelReason },
              successMessage,
              kind
            );
          },
        });
        return;
      }

      if (!response.ok) {
        setError(result.error || "Something went wrong. Please try again.");
        return;
      }

      setPending(null);
      onUpdated(result.settings);

      const cancelled = (result.cancelledBookings as string[] | undefined)?.length ?? 0;
      const notifyFailures = (result.notificationFailures as string[] | undefined)?.length ?? 0;
      const failed = (result.failedCancellations as string[] | undefined)?.length ?? 0;
      const retained = (result.retainedConflicts as string[] | undefined)?.length ?? 0;

      setSuccess(
        [
          successMessage,
          cancelled > 0 ? `${cancelled} booking(s) cancelled and parents notified.` : "",
          notifyFailures > 0
            ? `⚠️ ${notifyFailures} parent(s) could not be emailed — please contact them directly.`
            : "",
          failed > 0 ? `⚠️ ${failed} booking(s) could not be cancelled — please retry.` : "",
          // Kept on purpose, or booked in the moment the change was being applied — either way
          // the parent still expects a tour that the daycare can no longer host
          retained > 0
            ? `⚠️ ${retained} booking(s) still exist on the affected date(s) — please contact those parents.`
            : "",
        ]
          .filter(Boolean)
          .join(" ")
      );
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setBusy(null);
    }
  };

  const saveSchedule = () => {
    const invalid = weekly.find((entry) => !isValidTimeRange(entry.time));
    if (invalid) {
      setError(
        `"${invalid.time}" is not a valid time for ${DAY_NAMES[invalid.day]}. Use "6:00 PM" or "4:00 PM - 6:00 PM".`
      );
      return;
    }

    if (weekly.length === 0) {
      setError("Select at least one day, otherwise no parent will be able to book a tour.");
      return;
    }

    submit(
      `/api/admin/daycares/${settings.slug}/schedule`,
      "PUT",
      { weeklySchedule: weekly },
      "Tour hours updated.",
      "schedule"
    );
  };

  /** Expand an optional start/end range into individual YYYY-MM-DD strings. */
  const collectDates = (): string[] => {
    if (!newDate) return [];
    if (!newDateEnd || newDateEnd === newDate) return [newDate];
    if (newDateEnd < newDate) return [];

    const dates: string[] = [];
    const current = new Date(`${newDate}T00:00:00`);
    const end = new Date(`${newDateEnd}T00:00:00`);

    while (current <= end && dates.length <= 366) {
      dates.push(
        `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, "0")}-${current
          .getDate()
          .toString()
          .padStart(2, "0")}`
      );
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const blockDates = () => {
    const dates = collectDates();

    if (dates.length === 0) {
      setError("Pick a valid date (the end date must not be before the start date).");
      return;
    }

    submit(
      `/api/admin/daycares/${settings.slug}/blocked-dates`,
      "POST",
      { dates, reason: reason.trim() || undefined },
      `${dates.length} date(s) closed for tours.`,
      "block"
    );
  };

  const unblockDate = (date: string) => {
    submit(
      `/api/admin/daycares/${settings.slug}/blocked-dates`,
      "DELETE",
      { dates: [date] },
      `${date} re-opened for tours.`,
      "unblock"
    );
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-[#A8D5BA]/15 border border-[#A8D5BA]/40 text-sm text-[#2f6b48] flex items-start gap-2">
          <Check className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {pending && (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-bold text-amber-900">Existing bookings affected</h3>
              <p className="text-sm text-amber-800">{pending.message}</p>
            </div>
          </div>

          <ul className="space-y-2">
            {pending.conflicts.map((conflict) => (
              <li
                key={conflict.id}
                className="bg-white rounded-xl border border-amber-100 px-4 py-3 text-sm flex flex-wrap items-center gap-x-4 gap-y-1"
              >
                <span className="font-medium text-gray-900">{conflict.name}</span>
                <span className="text-gray-500">{conflict.email}</span>
                <span className="ml-auto text-[#0F3B4C] font-medium">
                  {conflict.date} · {conflict.time}
                </span>
              </li>
            ))}
          </ul>

          <div className="space-y-2">
            <Label htmlFor="cancel-reason" className="text-amber-900 font-medium">
              Message to parents (optional)
            </Label>
            <Textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. We are closed for a staff training day."
              className="min-h-[80px] bg-white rounded-xl border-amber-200 resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              disabled={busy !== null}
              onClick={() =>
                pending.submit({ force: true, cancelConflicts: true, reason: reason.trim() || undefined })
              }
              className="bg-[#d9534f] hover:bg-[#c9302c] text-white rounded-xl h-11"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel bookings & notify parents"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy !== null}
              onClick={() => pending.submit({ force: true, cancelConflicts: false })}
              className="rounded-xl h-11 border-amber-300 text-amber-900 hover:bg-amber-100"
            >
              Apply but keep these bookings
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={busy !== null}
              onClick={() => setPending(null)}
              className="rounded-xl h-11 text-gray-600"
            >
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
          </div>
          <p className="text-xs text-amber-800">
            &ldquo;Keep these bookings&rdquo; leaves the tours in place — please contact those parents
            yourself if you cannot host them.
          </p>
        </div>
      )}

      {/* Weekly tour hours */}
      <section className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0F3B4C]/10 flex items-center justify-center text-[#0F3B4C]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-[#0F3B4C]">Weekly Tour Hours</h2>
            <p className="text-sm text-gray-500">
              Choose which weekdays accept tours and the time offered on each day.
            </p>
          </div>
        </div>

        <div className="p-8 space-y-4">
          {DAY_NAMES.map((label, day) => {
            const enabled = timeByDay.has(day);
            return (
              <div
                key={label}
                className={cn(
                  "flex flex-wrap items-center gap-4 p-4 rounded-xl border-2 transition-colors",
                  enabled ? "border-[#0F3B4C]/20 bg-[#0F3B4C]/5" : "border-gray-100 bg-white"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={cn(
                    "w-28 h-10 rounded-lg text-sm font-medium transition-all",
                    enabled
                      ? "bg-[#0F3B4C] text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  )}
                >
                  {label}
                </button>

                {enabled ? (
                  <div className="flex items-center gap-3 flex-1 min-w-[220px]">
                    <Label htmlFor={`time-${label}`} className="sr-only">
                      {label} tour time
                    </Label>
                    <Input
                      id={`time-${label}`}
                      value={timeByDay.get(day) ?? ""}
                      onChange={(e) => setDayTime(day, e.target.value)}
                      placeholder="6:00 PM or 4:00 PM - 6:00 PM"
                      className="h-11 rounded-xl border-gray-200 focus:border-[#0F3B4C] focus:ring-[#0F3B4C]"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">Closed for tours</span>
                )}
              </div>
            );
          })}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
            <p className="text-sm text-gray-500">
              {previewSlots.length} bookable date(s) in the next two weeks with these hours.
            </p>
            <Button
              type="button"
              onClick={saveSchedule}
              disabled={busy !== null}
              className="bg-[#0F3B4C] hover:bg-[#092530] text-white h-12 px-8 rounded-xl"
            >
              {busy === "schedule" ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </span>
              ) : (
                "Save Tour Hours"
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Blocked dates */}
      <section className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#d9534f]/10 flex items-center justify-center text-[#d9534f]">
            <CalendarOff className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-[#0F3B4C]">Closed Dates</h2>
            <p className="text-sm text-gray-500">
              Holidays, staff training or any day you cannot host tours.
            </p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="block-start" className="text-gray-700 font-medium">
                From
              </Label>
              <Input
                id="block-start"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="h-12 rounded-xl border-gray-200 focus:border-[#0F3B4C] focus:ring-[#0F3B4C]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="block-end" className="text-gray-700 font-medium">
                To (optional)
              </Label>
              <Input
                id="block-end"
                type="date"
                value={newDateEnd}
                min={newDate || undefined}
                onChange={(e) => setNewDateEnd(e.target.value)}
                className="h-12 rounded-xl border-gray-200 focus:border-[#0F3B4C] focus:ring-[#0F3B4C]"
              />
            </div>
            <Button
              type="button"
              onClick={blockDates}
              disabled={busy !== null || !newDate}
              className="bg-[#d9534f] hover:bg-[#c9302c] text-white h-12 rounded-xl"
            >
              {busy === "block" ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Closing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Close These Dates
                </span>
              )}
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Currently closed</h3>

            {settings.blockedDates.length === 0 ? (
              <p className="text-sm text-gray-400">No closed dates yet.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {settings.blockedDates.map((date) => {
                  const ownerManaged = settings.ownerBlockedDates.includes(date);
                  return (
                    <li
                      key={date}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm",
                        ownerManaged
                          ? "bg-red-50 border-red-100 text-red-700"
                          : "bg-gray-50 border-gray-200 text-gray-500"
                      )}
                    >
                      <span>{date}</span>
                      {ownerManaged ? (
                        <button
                          type="button"
                          onClick={() => unblockDate(date)}
                          disabled={busy !== null}
                          aria-label={`Re-open ${date}`}
                          className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-xs uppercase tracking-wide">fixed</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            <p className="text-xs text-gray-400">
              &ldquo;Fixed&rdquo; closures come from the Waymaker partner configuration
              {role === "super_admin"
                ? " and can only be changed in partners.ts."
                : " — ask the Super Admin to change them."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
