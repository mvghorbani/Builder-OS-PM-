import { useEffect } from "react";
import LoginForm from "@/components/LoginForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function ConstructionIcon({
  variant = "neutral",
  size = 24,
}: { variant?: "neutral" | "blue"; size?: number }) {
  const cls =
    variant === "blue"
      ? "w-full h-full fill-blue-600"
      : "w-full h-full fill-gray-400";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cls}
      aria-hidden
    >
      <path d="M12 3a6 6 0 0 0-6 6v1.5C3.67 11.65 2 13.62 2 16v2a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2c0-2.38-1.67-4.35-4-5.5V9a6 6 0 0 0-6-6Zm-4 6a4 4 0 0 1 8 0v1.02c-.64-.02-1.32-.02-2-.02V7h-2v3c-.68 0-1.36 0-2 .02V9Z" />
    </svg>
  );
}

export default function Landing() {
  // ⌘K / Ctrl+K → focus first input (command menu placeholder)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      if ((isMac && e.metaKey && e.key.toLowerCase() === "k") || (!isMac && e.ctrlKey && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="email"], input')?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="w-full max-w-md px-4">
        <Card className="border-0 shadow-xl rounded-2xl backdrop-blur-xl bg-white/85">
          <CardHeader className="pb-2 text-center">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
              <ConstructionIcon variant="neutral" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
              BuilderOS PM
            </CardTitle>
          </CardHeader>

          <CardContent className="pb-6">
            <div className="mx-auto mb-5 w-full rounded-2xl border border-black/5 bg-gray-50/80 px-5 py-5 shadow-inner">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10">
                <div className="h-8 w-8">
                  <ConstructionIcon variant="blue" />
                </div>
              </div>
              <LoginForm />
            </div>

            <div className="mt-3 text-center text-xs text-gray-500">
              powered by AAlchemy Development Group
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-[11px] text-gray-500">
          © {new Date().getFullYear()} BuilderOS PM • v1 preview
        </div>
      </div>
    </div>
  );
}
