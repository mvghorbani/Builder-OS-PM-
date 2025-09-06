import { Plus, Upload, ClipboardCheck, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function QuickActions() {
  const { toast } = useToast();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Upload Document */}
      <Button
        type="button"
        variant="ghost"
        className="h-auto p-5 bg-gradient-to-br from-white via-gray-50 to-gray-100 hover:from-gray-50 hover:via-gray-100 hover:to-gray-150 rounded-xl flex flex-col items-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
        data-testid="button-upload-document"
        onClick={() => toast({ title: "Upload Document", description: "Document upload feature coming soon!" })}
        aria-label="Upload Document"
      >
        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mb-2 shadow-md">
          <Upload className="h-4 w-4 text-white" aria-hidden="true" />
        </div>
        <p className="font-medium text-gray-900">Upload Document</p>
        <p className="text-[11px] text-gray-600">Add project files</p>
      </Button>

      {/* Daily Log */}
      <Button
        type="button"
        variant="ghost"
        className="h-auto p-5 bg-gradient-to-br from-white via-gray-50 to-gray-100 hover:from-gray-50 hover:via-gray-100 hover:to-gray-150 rounded-xl flex flex-col items-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
        data-testid="button-daily-log"
        onClick={() => toast({ title: "Daily Log", description: "Daily log feature coming soon!" })}
        aria-label="Daily Log"
      >
        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mb-2 shadow-md">
          <ClipboardCheck className="h-4 w-4 text-white" aria-hidden="true" />
        </div>
        <p className="font-medium text-gray-900">Daily Log</p>
        <p className="text-[11px] text-gray-600">Record site activity</p>
      </Button>

      {/* Create RFQ */}
      <Button
        type="button"
        variant="ghost"
        className="h-auto p-5 bg-gradient-to-br from-white via-gray-50 to-gray-100 hover:from-gray-50 hover:via-gray-100 hover:to-gray-150 rounded-xl flex flex-col items-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
        data-testid="button-create-rfq"
        onClick={() => toast({ title: "Create RFQ", description: "RFQ creation feature coming soon!" })}
        aria-label="Create RFQ"
      >
        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mb-2 shadow-md">
          <Plus className="h-4 w-4 text-white" aria-hidden="true" />
        </div>
        <p className="font-medium text-gray-900">Create RFQ</p>
        <p className="text-[11px] text-gray-600">Get bids for work</p>
      </Button>

      {/* Submit RFI (blue, not purple) */}
      <Button
        type="button"
        variant="ghost"
        className="h-auto p-5 bg-gradient-to-br from-white via-gray-50 to-gray-100 hover:from-gray-50 hover:via-gray-100 hover:to-gray-150 rounded-xl flex flex-col items-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
        data-testid="button-submit-rfi"
        onClick={() => toast({ title: "Submit RFI", description: "RFI submission feature coming soon!" })}
        aria-label="Submit RFI"
      >
        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mb-2 shadow-md">
          <HelpCircle className="h-4 w-4 text-white" aria-hidden="true" />
        </div>
        <p className="font-medium text-gray-900">Submit RFI</p>
        <p className="text-[11px] text-gray-600">Request information</p>
      </Button>
    </div>
  );
}
