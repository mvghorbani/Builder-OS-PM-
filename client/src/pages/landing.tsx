import { useEffect } from "react";
import LoginForm from "@/components/LoginForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BrandIcon from "@/components/BrandIcon";

export default function Landing() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      if ((mac && e.metaKey && e.key.toLowerCase() === "k") || (!mac && e.ctrlKey && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="email"],input')?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen grid place-items-center airy-space px-4">
      <div className="w-full max-w-md">
        <Card className="glass-card border-0">
          <CardHeader className="pb-2 text-center">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/40 backdrop-blur-sm">
              <BrandIcon variant="neutral" size={24} />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
              BuilderOS PM
            </CardTitle>
          </CardHeader>

          <CardContent className="pb-6">
            <div className="mx-auto w-full rounded-2xl border border-white/20 bg-white/30 backdrop-blur-xl p-5 shadow-inner">
              <div className="space-y-4">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blue-500/10">
                  <BrandIcon variant="brand" size={28} />
                </div>
                <LoginForm />
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-gray-500">
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
