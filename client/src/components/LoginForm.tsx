import React, { useState, useEffect } from 'react'; // Added useEffect
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { GoogleLogin } from '@react-oauth/google';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // State for Google auth error
  const { toast } = useToast();

  // Function to handle Google login success
  const handleGoogleSuccess = async (credentialResponse: any) => {
    console.log("Google login success:", credentialResponse);
    try {
      const response = await fetch('/api/v1/auth/google/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: credentialResponse.credential
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Authentication successful:", data);
        // The JWT token is now set as a cookie, redirect to dashboard
        window.location.href = '/';
      } else {
        const error = await response.json();
        console.error("Authentication failed:", error);
        setError(error.message || "Authentication failed");
        toast({
          title: "Google Login Failed",
          description: error.message || "Authentication failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Network error:", error);
      setError("Network error occurred");
      toast({
        title: "Google Login Failed",
        description: "A network error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to handle Google login error
  const handleGoogleError = () => {
    console.log('Login Failed');
    setError("Google login failed. Please try again.");
    toast({
      title: "Google Login Failed",
      description: "Google login failed. Please try again.",
      variant: "destructive",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // Clear previous errors

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
              onClick={() => window.location.href = '/api/v1/auth/replit'} // Corrected Replit auth endpoint
              data-testid="button-replit-login"
            >
              Continue with Replit
            </Button>
            <div className="mt-2">
              {/* Moved GoogleLogin inside GoogleOAuthProvider */}
              <GoogleLogin
                onSuccess={handleGoogleSuccess} // Use the dedicated handler
                onError={handleGoogleError} // Use the dedicated handler
                size="large"
                shape="rectangular"
                theme="outline"
                type="icon" // Keep type as icon
                width="100%" // Ensure it takes full width within its container
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            Secure authentication powered by ConstructPro
          </p>
        </CardContent>
      </Card>
    );
}