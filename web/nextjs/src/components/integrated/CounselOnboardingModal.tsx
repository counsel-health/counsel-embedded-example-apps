"use client";

import { cn } from "@/lib/utils";
import {
  Activity,
  BookOpen,
  FileSearch,
  Stethoscope,
  UserPlus,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type CounselOnboardingModalProps = {
  open: boolean;
  onComplete: () => void;
};

const FEATURES = [
  {
    icon: FileSearch,
    title: "Search medical records",
    description: "Personalized insights from your patient history",
  },
  {
    icon: Activity,
    title: "Wearable data",
    description: "Real-time health metrics from your devices",
  },
  {
    icon: BookOpen,
    title: "Clinical sources",
    description: "Backed by peer-reviewed medical research",
  },
  {
    icon: UserPlus,
    title: "Add a doctor",
    description: "Bring a licensed physician into your chat",
  },
] as const;

const AUTO_DISMISS_MS = 5000;

export default function CounselOnboardingModal({
  open,
  onComplete,
}: CounselOnboardingModalProps) {
  const [phase, setPhase] = useState<"enter" | "visible" | "exit">("enter");
  const [activeFeature, setActiveFeature] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) {
      setPhase("enter");
      setActiveFeature(0);
      setProgress(0);
      return;
    }
    requestAnimationFrame(() => setPhase("visible"));
  }, [open]);

  useEffect(() => {
    if (phase !== "visible") return;

    const start = Date.now();
    let raf: number;

    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / AUTO_DISMISS_MS, 1);
      setProgress(pct);

      const featureIndex = Math.min(
        Math.floor(pct * FEATURES.length),
        FEATURES.length - 1,
      );
      setActiveFeature(featureIndex);

      if (pct < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        handleDismiss();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleDismiss = useCallback(() => {
    setPhase("exit");
    setTimeout(onComplete, 300);
  }, [onComplete]);

  if (!open && phase === "enter") return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "transition-opacity duration-300 ease-out",
        phase === "visible" ? "opacity-100" : "opacity-0",
      )}
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={handleDismiss}
      />

      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-xl",
          "bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800",
          "transition-all duration-300 ease-out",
          phase === "visible"
            ? "translate-y-0 scale-100 opacity-100"
            : phase === "enter"
              ? "translate-y-6 scale-[0.97] opacity-0"
              : "translate-y-[-8px] scale-[0.97] opacity-0",
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-500/15">
              <Stethoscope className="size-5 text-brand-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Connecting to Counsel
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Your AI medical assistant
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex size-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            aria-label="Close"
          >
            <X className="size-3.5" />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-5 border-t border-zinc-100 dark:border-zinc-800" />

        {/* Features */}
        <div className="p-5 space-y-1">
          {FEATURES.map((feature, i) => {
            const isActive = i === activeFeature;
            const isRevealed = i <= activeFeature;

            return (
              <div
                key={feature.title}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-400",
                  isActive
                    ? "bg-brand-50 dark:bg-brand-500/10"
                    : "bg-transparent",
                  isRevealed
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-2",
                )}
                style={{
                  transitionDelay: isRevealed ? `${i * 50}ms` : "0ms",
                }}
              >
                <feature.icon
                  className={cn(
                    "size-4 shrink-0 transition-colors duration-400",
                    isActive
                      ? "text-brand-300"
                      : "text-zinc-300 dark:text-zinc-600",
                  )}
                />
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors duration-300",
                      isActive
                        ? "text-zinc-900 dark:text-zinc-100"
                        : "text-zinc-400 dark:text-zinc-500",
                    )}
                  >
                    {feature.title}
                  </p>
                  <p
                    className={cn(
                      "text-xs transition-all duration-400 overflow-hidden",
                      isActive
                        ? "text-zinc-500 dark:text-zinc-400 max-h-10 opacity-100 mt-0.5"
                        : "max-h-0 opacity-0",
                    )}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-brand-200 transition-[width] duration-100 ease-linear"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <button
            onClick={handleDismiss}
            className="mt-3.5 w-full rounded-lg bg-brand-400 py-2 text-sm font-medium text-white hover:bg-brand-500 active:scale-[0.99] transition-all duration-150"
          >
            Get started
          </button>
        </div>
      </div>
    </div>
  );
}
