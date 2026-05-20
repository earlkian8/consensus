import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/shadcnUI/button";
import { Card } from "@/components/shadcnUI/card";
import { Input } from "@/components/shadcnUI/input";
import { fireToast } from "@/components/sileo/SileoToast";
import api from "@/lib/api";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await api.post("/api/auth/login", { email, password });

            localStorage.setItem("token", response.data.token);

            fireToast("success", {
                title: "Welcome back",
                description: "You have successfully logged in."
            });

            navigate("/dashboard");
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Failed to log in";

            fireToast("error", {
                title: "Login failed",
                description: errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-[860px] mx-auto px-4 py-6 pb-10">
            <h1 className="text-xl font-bold text-foreground mb-1">Welcome back</h1>
            <p className="text-xs text-muted-foreground mb-[18px]">Sign in to access Consensus.</p>

            <Card className="p-4 max-w-[420px] mx-auto mb-2.5 shadow-sm">
                <form onSubmit={handleLogin}>
                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">Email</label>
                        <Input
                            type="email"
                            placeholder="you@team.com"
                            className="h-[34px] text-[13px] rounded-[7px] bg-background"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1 mt-2.5">
                        <label className="text-[11px] font-semibold text-muted-foreground">Password</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            className="h-[34px] text-[13px] rounded-[7px] bg-background"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full mt-4 font-semibold"
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing in..." : "Sign in"}
                    </Button>
                </form>

                <div className="mt-2.5 text-[11px] text-muted-foreground">
                    No account yet? <Link to="/register" className="text-primary hover:underline">Register</Link>
                </div>
            </Card>
        </div>
    );
}