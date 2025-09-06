import { Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function Header({ title, description, children }: HeaderProps) {
  const { toast } = useToast();

  return (
    <header className="px-6 pt-6">
      <div className="mx-auto max-w-xl rounded-2xl border border-black/10 ring-1 ring-black/5 bg-white/70 dark:bg-neutral-900/50 backdrop-blur px-6 py-4 text-center shadow-[0_1px_0_rgba(0,0,0,0.08),0_12px_30px_rgba(0,0,0,0.04)]">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-gray-500 mt-1">
            {description}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button data-testid="button-create-project">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          {children}
        </Dialog>

        <Button 
          variant="ghost" 
          size="icon" 
          data-testid="button-notifications"
          onClick={() => toast({ 
            title: "Notifications", 
            description: "You have no new notifications." 
          })}
        >
          <Bell className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
