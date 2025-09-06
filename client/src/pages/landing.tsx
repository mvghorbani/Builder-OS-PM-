import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "@/components/LoginForm";

export default function Landing() {
  // ⌘K / Ctrl+K → focus first input (command menu placeholder)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      if ((isMac && e.metaKey && e.key.toLowerCase() === "k") || (!isMac && e.ctrlKey && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        const first = document.querySelector<HTMLInputElement>('input[type="email"], input');
        first?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col">
      {/* simple macOS-like top bar */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/60 border-b border-black/5">
        <div className="max-w-5xl mx-auto h-12 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-2 mr-2">
              <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
              <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
              <span className="h-3 w-3 rounded-full bg-[#28C840]" />
            </div>
            <span className="font-semibold tracking-tight">BuilderOS</span>
            <span className="ml-2 hidden sm:inline text-xs px-2 py-0.5 rounded-full bg-black/5">
              Construction Project Management
            </span>
          </div>
          <div className="hidden md:block text-xs text-gray-500">
            Tip: Press <kbd className="px-1 py-0.5 rounded border">⌘K</kbd> (or Ctrl+K)
          </div>
        </div>
      </div>

      {/* center card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-0 backdrop-blur-xl bg-white/80">
            <CardHeader className="space-y-4 pb-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-lg mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">BuilderOS PM</CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  Project Management
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <LoginForm />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* footer */}
      <footer className="text-center text-xs text-gray-500 pb-6">
        © {new Date().getFullYear()} BuilderOS • v1 preview
      </footer>
    </div>
  );
}
