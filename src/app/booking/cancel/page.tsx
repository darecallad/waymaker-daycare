"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function CancelBookingContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleCancel = async () => {
    if (!id) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/booking/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id }),
      });
      
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-stone-900">Invalid Link</h2>
            <p className="text-stone-600 mt-2">No booking ID found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-stone-100">
        <CardHeader className="text-center border-b border-stone-100 pb-6">
          <CardTitle className="text-2xl font-serif text-[#0F3B4C]">Cancel Booking</CardTitle>
        </CardHeader>
        <CardContent className="pt-8 pb-8 text-center">
          {status === "idle" && (
            <div className="space-y-6">
              <p className="text-stone-600">
                Are you sure you want to cancel your daycare tour? This action cannot be undone.
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  variant="destructive" 
                  onClick={handleCancel}
                  className="w-full bg-red-500 hover:bg-red-600"
                >
                  Yes, Cancel Booking
                </Button>
              </div>
            </div>
          )}

          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-10 w-10 animate-spin text-[#0F3B4C] mb-4" />
              <p className="text-stone-500">Processing cancellation...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4 animate-fade-in">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-900">Booking Cancelled</h3>
              <p className="text-stone-600">
                Your tour has been successfully cancelled. We have notified the daycare.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4 animate-fade-in">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-900">Error</h3>
              <p className="text-stone-600">
                We couldn't cancel your booking. It may have already been cancelled or expired.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CancelBookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <CancelBookingContent />
    </Suspense>
  );
}
