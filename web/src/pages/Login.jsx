// src/pages/Login.jsx
import { Link } from "react-router-dom";
import { Button } from "@/components/shadcnUI/button";
import { Card } from "@/components/shadcnUI/card";
import { Input } from "@/components/shadcnUI/input";

export default function Login() {
    return (
        <div className="max-w-215 mx-auto px-4 py-6 pb-10">
            <h1 className="text-xl font-bold text-foreground mb-1">Welcome back</h1>
            <p className="text-xs text-muted-foreground mb-4.5">Sign in to access Consensus.</p>

            <Card className="p-4 max-w-105 mx-auto mb-2.5 shadow-sm">
                <div className="flex flex-col gap-1">
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
                        placeholder="••••••••"
                        className="h-8.5 text-[13px] rounded-[7px] bg-background"
                    />
                </div>

                <Button
                    type="button"
                    className="w-full mt-4 font-semibold"
                >
                    Sign in
                </Button>

                <div className="mt-2.5 text-[11px] text-muted-foreground">
                    No account yet? <Link to="/register" className="text-primary hover:underline">Register</Link>
                </div>
            </Card>
        </div>
    );
}