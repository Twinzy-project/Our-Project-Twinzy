import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerWithEmail } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import AuthLayout from "@/components/AuthLayout";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function SignUp() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const result = await registerWithEmail(data.email, data.password, data.name);
      
      if (result.success) {
        toast({
          title: "Account created",
          description: "Your account has been created successfully!",
        });
        setLocation("/dashboard");
      } else {
        setErrorMessage(result.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthLayout>
      <p className="text-gray-600 mb-6">Create your account</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input 
                    placeholder="Full Name" 
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
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Confirm Password" 
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
            {isLoading ? "Signing Up..." : "Sign Up"}
          </Button>
        </form>
      </Form>
      
      {errorMessage && (
        <div className="mt-3 text-sm text-red-500 h-5">{errorMessage}</div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <span>Already have an account?</span>
        <Button 
          variant="link" 
          onClick={() => setLocation("/login")}
          className="p-0 h-auto text-primary hover:underline ml-1"
        >
          Sign In
        </Button>
      </div>
    </AuthLayout>
  );
}
