import { Link } from "react-router-dom";
import { Button } from "@/components/shadcnUI/button";
import { Card } from "@/components/shadcnUI/card";
import { Input } from "@/components/shadcnUI/input";

export default function Login() {
    return (
        <div className="page active">
            <div className="page-title">Welcome back</div>
            <div className="page-sub">Sign in to access Consensus.</div>
            <Card className="card" style={{ maxWidth: "420px", margin: "0 auto" }}>
                <div className="field">
                    <label>Email</label>
                    <Input className="field-input" type="email" placeholder="you@team.com" />
                </div>
                <div className="field" style={{ marginTop: "10px" }}>
                    <label>Password</label>
                    <Input className="field-input" type="password" placeholder="••••••••" />
                </div>
                <Button
                    className="btn btn-green btn-full"
                    type="button"
                    style={{ marginTop: "16px" }}
                >
                    Sign in
                </Button>
                <div style={{ marginTop: "10px", fontSize: "11px", color: "var(--text-t)" }}>
                    No account yet? <Link to="/register">Register</Link>
                </div>
            </Card>
        </div>
    );
}
