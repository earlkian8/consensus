// src/pages/Register.jsx
import { Link } from "react-router-dom";
import { Button } from "@/components/shadcnUI/button";
import { Card } from "@/components/shadcnUI/card";
import { Input } from "@/components/shadcnUI/input";

export default function Register() {
    return (
        <div className="max-w-6xl mx-auto px-6 py-6 pb-10">
            <h1 className="text-xl font-bold text-foreground mb-1">Create your account</h1>
            <p className="text-xs text-muted-foreground mb-4.5">Set up Consensus access for your team.</p>

            <Card className="p-4 max-w-105 mx-auto mb-2.5 shadow-sm">
                <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">Name</label>
                    <Input
                        type="text"
                        placeholder="Kitchen manager"
                        className="h-8.5 text-[13px] rounded-[7px] bg-background"
                    />
                </div>

                <div className="flex flex-col gap-1 mt-2.5">
                    <label className="text-[11px] font-semibold text-muted-foreground">Email</label>
                    <Input
                        type="email"
                        placeholder="you@team.com"
                        className="h-8.5 text-[13px] rounded-[7px] bg-background"
                    />
                </div>

                <div className="flex flex-col gap-1 mt-2.5">
                    <label className="text-[11px] font-semibold text-muted-foreground">Password</label>
                    <Input
                        type="password"
                        placeholder="Create a password"
                        className="h-8.5 text-[13px] rounded-[7px] bg-background"
                    />
                </div>

                <Button
                    type="button"
                    className="w-full mt-4 font-semibold"
                >
                    Create account
                </Button>

                <div className="mt-2.5 text-[11px] text-muted-foreground">
                    Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
                </div>
            </Card>
        </div>
    );
}