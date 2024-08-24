import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
    title: "Sign In",
    description: "Access your account",
};

export default function SignUpPage() {
    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <Link
                href="/"
                className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "absolute left-4 top-4 md:left-8 md:top-8"
                )}
            >
                <>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                </>
            </Link>
            <div className="mx-auto flex w-full flex-col justify-center gap-6 sm:w-[350px]">
                <div className="flex flex-col gap-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Welcome back
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Access your account to continue
                    </p>
                </div>

                <div className="flex w-full h-full items-center justify-center">
                    <SignIn fallbackRedirectUrl="/dashboard" signUpUrl="/sign-up" />
                </div>
            </div>
        </div>
    );
}