import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layers, Loader2 } from "lucide-react";
import { Button } from "@/components/shadcnUI/button";
import { Input } from "@/components/shadcnUI/input";
import { fireToast } from "@/components/sileo/SileoToast";
import { api } from "@/lib/api";

export default function Register() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.post("/auth/register", { email, password });

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
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-[400px] flex flex-col items-center"
            >
                {/* Logo / Icon Area */}
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-6">
                    <Layers size={28} className="text-primary" />
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1.5">Create an account</h1>
                    <p className="text-sm text-muted-foreground">Set up Consensus access for your team.</p>
                </div>

                <div className="w-full bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm relative">
                    <form onSubmit={handleRegister} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-foreground">Email</label>
                            <Input
                                type="email"
                                placeholder="you@team.com"
                                className="h-10 text-sm rounded-xl bg-muted/30 border-border/50 focus-visible:bg-background transition-colors"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-foreground">Password</label>
                            <Input
                                type="password"
                                placeholder="Create a secure password"
                                className="h-10 text-sm rounded-xl bg-muted/30 border-border/50 focus-visible:bg-background transition-colors"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-10 rounded-xl font-semibold mt-2 transition-transform active:scale-[0.98]"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin" />
                                    Creating account...
                                </span>
                            ) : (
                                "Create account"
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-xs text-muted-foreground">
                        Already have an account?{" "}
                        <Link to="/login" className="font-semibold text-primary hover:underline">
                            Sign in here
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}