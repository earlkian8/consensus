import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/shadcnUI/button";
import { Card } from "@/components/shadcnUI/card";
import { Input } from "@/components/shadcnUI/input";
import { fireToast } from "@/components/sileo/SileoToast";
import api from "@/lib/api";

export default function Register() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.post("/api/auth/register", { email, password });

            fireToast("success", {
                title: "Account created",
                description: "You can now log in with your new credentials."
            });

            navigate("/login");
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Registration failed";

            fireToast("error", {
                title: "Registration failed",
                description: errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-[860px] mx-auto px-4 py-6 pb-10">
            <h1 className="text-xl font-bold text-foreground mb-1">Create your account</h1>
            <p className="text-xs text-muted-foreground mb-[18px]">Set up Consensus access for your team.</p>

            <Card className="p-4 max-w-[420px] mx-auto mb-2.5 shadow-sm">
                <form onSubmit={handleRegister}>
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
                            placeholder="Create a password"
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
                        {isLoading ? "Creating account..." : "Create account"}
                    </Button>
                </form>

                <div className="mt-2.5 text-[11px] text-muted-foreground">
                    Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
                </div>
            </Card>
        </div>
    );
}