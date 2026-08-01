"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { AuditAction, AuditEntry, UserRole } from "@/lib/types";
import {
  ArrowRight,
  CalendarOff,
  CalendarPlus,
  Clock,
  FileClock,
  Loader2,
  LogIn,
  LogOut,
  ShieldAlert,
} from "lucide-react";

const PAGE_SIZE = 25;
/** Delay before an edited Administrator filter triggers a request. */
const FILTER_DEBOUNCE_MS = 350;

/** Label and icon for each recorded action. */
const ACTION_META: Record<AuditAction, { label: string; icon: typeof Clock }> = {
  "login.code_requested": { label: "Login code requested", icon: LogIn },
  "login.succeeded": { label: "Signed in", icon: LogIn },
  "login.failed": { label: "Failed sign-in", icon: ShieldAlert },
  logout: { label: "Signed out", icon: LogOut },
  "schedule.updated": { label: "Tour hours changed", icon: Clock },
  "dates.blocked": { label: "Dates closed", icon: CalendarOff },
  "dates.unblocked": { label: "Dates re-opened", icon: CalendarPlus },
  "booking.cancelled": { label: "Booking cancelled", icon: CalendarOff },
};

interface AuditLogPanelProps {
  /** Limit the trail to one daycare; omit to show every location. */
  slug?: string;
  /** Only a Super Admin may read the trail across every location. */
  role?: UserRole;
  /** Change this value to pull in entries written by an action just performed. */
  refreshToken?: number;
}

/**
 * Read-only activity trail.
 *
 * Shows which administrator changed what and when, so an unexpected schedule change can be
 * traced back to a person. Entries can never be edited or removed from the dashboard.
 */
export default function AuditLogPanel({
  slug,
  role = "admin",
  refreshToken = 0,
}: AuditLogPanelProps) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [scopeAll, setScopeAll] = useState(false);
  const [actor, setActor] = useState("");
  const [debouncedActor, setDebouncedActor] = useState("");
  const [action, setAction] = useState<AuditAction | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // The Administrator box changes on every keystroke; without this, typing an address would
  // issue one request per character and each of them re-reads the trail.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedActor(actor.trim()), FILTER_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [actor]);

  const load = useCallback(
    async (signal: AbortSignal) => {
      setIsLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        if (slug && !scopeAll) params.set("slug", slug);
        if (debouncedActor) params.set("actor", debouncedActor);
        if (action) params.set("action", action);
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        params.set("limit", String(PAGE_SIZE));
        params.set("offset", String(page * PAGE_SIZE));

        const response = await fetch(`/api/admin/audit-log?${params.toString()}`, { signal });
        const result = await response.json();

        if (!response.ok) {
          setError(result.error || "Could not load the activity log.");
          setEntries([]);
          return;
        }

        setEntries(result.entries);
        setTotal(result.total);
      } catch (err) {
        // A superseded request is not a failure: its replacement is already in flight
        if (signal.aborted || (err as Error)?.name === "AbortError") return;
        setError("Network error. Please try again.");
        setEntries([]);
      } finally {
        if (!signal.aborted) setIsLoading(false);
      }
    },
    // `refreshToken` is not read inside this callback: it only exists so the parent can force
    // a re-fetch after it changes something that writes a new entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slug, scopeAll, debouncedActor, action, from, to, page, refreshToken]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    // Drop the response of a filter that has already been replaced, so a slow earlier
    // request cannot overwrite the list with stale entries.
    return () => controller.abort();
  }, [load]);

  // Any filter change restarts paging, otherwise page 3 of a new filter looks empty
  const applyFilter = (apply: () => void) => {
    setPage(0);
    apply();
  };

  const clearFilters = () => {
    setPage(0);
    setActor("");
    setAction("");
    setFrom("");
    setTo("");
  };

  const hasFilters = Boolean(actor || action || from || to);
  const lastPage = Math.max(Math.ceil(total / PAGE_SIZE) - 1, 0);

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#0F3B4C]/10 flex items-center justify-center text-[#0F3B4C]">
          <FileClock className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-serif font-bold text-[#0F3B4C]">Activity Log</h2>
          <p className="text-sm text-gray-500">
            Every change is recorded with the email that made it. This log cannot be edited.
          </p>
        </div>

        {slug && role === "super_admin" && (
          <div className="ml-auto flex rounded-xl border border-gray-200 overflow-hidden text-sm">
            <button
              type="button"
              onClick={() => applyFilter(() => setScopeAll(false))}
              className={cn(
                "px-4 py-2 transition-colors",
                scopeAll ? "bg-white text-gray-600 hover:bg-gray-50" : "bg-[#0F3B4C] text-white"
              )}
            >
              This location
            </button>
            <button
              type="button"
              onClick={() => applyFilter(() => setScopeAll(true))}
              className={cn(
                "px-4 py-2 transition-colors",
                scopeAll ? "bg-[#0F3B4C] text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              )}
            >
              All activity
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <Label htmlFor="audit-actor" className="text-xs text-gray-600">
            Administrator
          </Label>
          <Input
            id="audit-actor"
            value={actor}
            onChange={(event) => applyFilter(() => setActor(event.target.value))}
            placeholder="name@example.com"
            className="mt-1 rounded-xl"
          />
        </div>

        <div>
          <Label htmlFor="audit-action" className="text-xs text-gray-600">
            Action
          </Label>
          <select
            id="audit-action"
            value={action}
            onChange={(event) => applyFilter(() => setAction(event.target.value as AuditAction | ""))}
            className="mt-1 w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700"
          >
            <option value="">All actions</option>
            {(Object.keys(ACTION_META) as AuditAction[]).map((key) => (
              <option key={key} value={key}>
                {ACTION_META[key].label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="audit-from" className="text-xs text-gray-600">
            From
          </Label>
          <Input
            id="audit-from"
            type="date"
            value={from}
            onChange={(event) => applyFilter(() => setFrom(event.target.value))}
            className="mt-1 rounded-xl"
          />
        </div>

        <div>
          <Label htmlFor="audit-to" className="text-xs text-gray-600">
            To
          </Label>
          <Input
            id="audit-to"
            type="date"
            value={to}
            onChange={(event) => applyFilter(() => setTo(event.target.value))}
            className="mt-1 rounded-xl"
          />
        </div>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm text-[#0F3B4C] underline mb-4"
        >
          Clear filters
        </button>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#0F3B4C]" />
        </div>
      ) : entries.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">
          {hasFilters ? "No activity matches these filters." : "No activity recorded yet."}
        </p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => {
            const meta = ACTION_META[entry.action];
            const Icon = meta?.icon ?? Clock;
            const failed = entry.outcome !== "success";

            return (
              <li
                key={entry.id}
                className={cn(
                  "p-4 rounded-xl border",
                  failed ? "bg-amber-50 border-amber-100" : "bg-gray-50 border-gray-100"
                )}
              >
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Icon
                    className={cn("w-4 h-4", failed ? "text-amber-600" : "text-[#0F3B4C]")}
                  />
                  <span className="font-semibold text-[#0F3B4C]">
                    {meta?.label ?? entry.action}
                  </span>
                  {failed && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs">
                      {entry.outcome === "denied" ? "Blocked" : "Error"}
                    </span>
                  )}
                  <span className="ml-auto text-xs text-gray-500">
                    {new Date(entry.at).toLocaleString()}
                  </span>
                </div>

                <p className="mt-2 text-sm text-gray-700">{entry.summary}</p>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                  <span className="font-medium text-gray-600">{entry.actor}</span>
                  {entry.daycareName && <span>· {entry.daycareName}</span>}
                  {entry.ip && <span>· IP {entry.ip}</span>}
                  {entry.affectedBookings && entry.affectedBookings.length > 0 && (
                    <span>· {entry.affectedBookings.length} booking(s) affected</span>
                  )}
                </div>

                {entry.before !== undefined && entry.after !== undefined && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2 py-1 rounded-lg bg-white border border-gray-200 text-gray-500 line-through">
                      {entry.before}
                    </span>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <span className="px-2 py-1 rounded-lg bg-white border border-[#A8D5BA] text-[#0F3B4C]">
                      {entry.after}
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {total > PAGE_SIZE && (
        <div className="mt-6 flex items-center justify-between text-sm">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            disabled={page === 0 || isLoading}
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
          >
            Previous
          </Button>
          <span className="text-gray-500">
            Page {page + 1} of {lastPage + 1} · {total} entries
          </span>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            disabled={page >= lastPage || isLoading}
            onClick={() => setPage((current) => Math.min(current + 1, lastPage))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
