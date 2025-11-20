import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";
import { SiGoogle } from "react-icons/si";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, signInWithGoogle, currentUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!authLoading && currentUser) {
      setLocation("/dashboard");
    }
  }, [currentUser, authLoading, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(credentials.email, credentials.password);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      let errorMessage = "Invalid email or password";
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later.";
      }

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      
      toast({
        title: result.isNewUser ? "Welcome!" : "Welcome back!",
        description: result.isNewUser 
          ? "You have successfully signed up with Google." 
          : "You have successfully logged in with Google.",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      let errorMessage = "Failed to sign in with Google";
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in cancelled";
      } else if (error.code === "auth/cancelled-popup-request") {
        errorMessage = "Sign-in cancelled";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Google Sign-In Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-16 md:py-24 bg-background">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-3xl text-center">Welcome Back</CardTitle>
              <p className="text-muted-foreground text-center">
                Login to access your PEF account
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={credentials.email}
                    onChange={(e) =>
                      setCredentials((prev) => ({ ...prev, email: e.target.value }))
                    }
                    data-testid="input-login-email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials((prev) => ({ ...prev, password: e.target.value }))
                    }
                    data-testid="input-login-password"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loading || googleLoading}
                  data-testid="button-login-submit"
                >
                  {loading ? "Logging in..." : "Login"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={loading || googleLoading}
                  data-testid="button-google-signin"
                >
                  <SiGoogle className="mr-2 w-5 h-5" />
                  {googleLoading ? "Signing in..." : "Sign in with Google"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  <Link href="/forgot-password" className="text-primary hover:underline" data-testid="link-forgot-password">
                    Forgot your password?
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline font-semibold" data-testid="link-signup">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
