"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons"

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const error = searchParams?.get("error");

  useEffect(() => {
    if (error) {
      if (error === "domain") {
        toast.error("Authentication failed. Only @ingren.ai email addresses are allowed.");
      } else {
        toast.error("Authentication failed. Please try again.");
      }
    }
  }, [error]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      toast.error("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex bg-muted items-center justify-center p-8">
        <div className="max-w-md">
          <Image
            src="/images/login-illustration.svg" 
            alt="Login illustration"
            width={500}
            height={500}
            className="dark:invert"
          />
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold">INGREN</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.google className="mr-2 h-4 w-4" />
              )}
              Sign in with Google
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button variant="link" className="text-xs px-0" disabled={isLoading}>
                  Forgot password?
                </Button>
              </div>
              <Input id="password" type="password" disabled={isLoading} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Sign In
            </Button>
            <p className="mt-2 text-xs text-center text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <Button variant="link" className="text-xs px-0 h-auto">
                Terms of Service
              </Button>{" "}
              and{" "}
              <Button variant="link" className="text-xs px-0 h-auto">
                Privacy Policy
              </Button>
              .
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}