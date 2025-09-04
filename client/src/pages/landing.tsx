import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-hard-hat text-primary-foreground text-2xl"></i>
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">ConstructPro</h1>
          <p className="text-muted-foreground mb-6">
            Professional construction project management platform
          </p>
          
          <Button 
            className="w-full"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-login"
          >
            Sign In
          </Button>
          
          <p className="text-xs text-muted-foreground mt-4">
            Secure authentication powered by Replit
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
