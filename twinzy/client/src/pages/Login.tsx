import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginWithEmail, signInWithGoogle, signInWithGithub, resetPassword } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import AuthLayout from "@/components/AuthLayout";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  
  // Login form
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  // Forgot password form
  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  
  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const result = await loginWithEmail(data.email, data.password);
      
      if (result.success) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        setLocation("/dashboard");
      } else {
        setErrorMessage(result.error || "Login failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setErrorMessage("");
    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        setLocation("/dashboard");
      } else {
        setErrorMessage(result.error || "Google login failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };
  
  const handleGithubLogin = async () => {
    setErrorMessage("");
    try {
      const result = await signInWithGithub();
      
      if (result.success) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        setLocation("/dashboard");
      } else {
        setErrorMessage(result.error || "GitHub login failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };
  
  const handleForgotPassword = async (data: z.infer<typeof forgotPasswordSchema>) => {
    try {
      const result = await resetPassword(data.email);
      
      if (result.success) {
        toast({
          title: "Password reset email sent",
          description: "Please check your email for instructions to reset your password.",
        });
        setIsForgotPasswordOpen(false);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send password reset email. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <AuthLayout>
      <p className="text-gray-600 mb-6">Sign in to track your goals</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input 
                    placeholder="Email" 
                    {...field} 
                    className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Password" 
                    {...field} 
                    className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary hover:bg-opacity-90 text-white font-medium py-3 px-4 rounded-xl transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </Form>
      
      {errorMessage && (
        <div className="mt-3 text-sm text-red-500 h-5">{errorMessage}</div>
      )}
      
      <div className="flex justify-between text-sm mt-4 text-gray-600">
        <Button 
          variant="link" 
          onClick={() => setIsForgotPasswordOpen(true)} 
          className="p-0 h-auto text-gray-600 hover:text-primary transition-colors"
        >
          Forgot Password?
        </Button>
        <Button 
          variant="link" 
          onClick={() => setLocation("/signup")} 
          className="p-0 h-auto text-gray-600 hover:text-primary transition-colors"
        >
          Sign Up
        </Button>
      </div>
      
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or sign in with</span>
        </div>
      </div>
      
      <div className="flex justify-center space-x-4">
        <Button 
          variant="outline" 
          onClick={handleGoogleLogin}
          className="w-12 h-12 rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-50 transition-colors p-0"
        >
          <i className="fab fa-google text-[#4285F4]"></i>
        </Button>
        <Button 
          variant="outline" 
          onClick={handleGithubLogin}
          className="w-12 h-12 rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-50 transition-colors p-0"
        >
          <i className="fab fa-github"></i>
        </Button>
      </div>
      
      {/* Forgot Password Dialog */}
      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...forgotPasswordForm}>
            <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
              <FormField
                control={forgotPasswordForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Send Reset Link</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AuthLayout>
  );
}
