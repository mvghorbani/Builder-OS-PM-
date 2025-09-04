
import React, { useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('/api/v1/auth/login', {
        email,
        password
      });

      // Save JWT token to localStorage
      const { token } = response.data;
      localStorage.setItem('token', token);

      // Show success message
      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
      });

      // Redirect to main projects dashboard
      window.location.href = '/';
    } catch (error) {
      // Display error message
      let errorMessage = 'Login failed. Please try again.';
      
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-4">
      <CardHeader>
        <CardTitle className="text-center">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-hard-hat text-primary-foreground text-2xl"></i>
          </div>
          ConstructPro
        </CardTitle>
        <p className="text-center text-muted-foreground">
          Sign in to your account
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
            data-testid="button-login"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">or</p>
          <Button 
            variant="outline"
            className="w-full mt-2"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-replit-login"
          >
            Continue with Replit
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Secure authentication powered by ConstructPro
        </p>
      </CardContent>
    </Card>
  );
}
