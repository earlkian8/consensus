import { Link } from "react-router-dom";
import { Button } from "@/components/shadcnUI/button";
import { Card } from "@/components/shadcnUI/card";
import { Input } from "@/components/shadcnUI/input";

export default function Register() {
    return (
        <div className="page active">
            <div className="page-title">Create your account</div>
            <div className="page-sub">Set up Consensus access for your team.</div>
            <Card className="card" style={{ maxWidth: "420px", margin: "0 auto" }}>
                <div className="field">
                    <label>Name</label>
                    <Input className="field-input" type="text" placeholder="Kitchen manager" />
                </div>
                <div className="field" style={{ marginTop: "10px" }}>
                    <label>Email</label>
                    <Input className="field-input" type="email" placeholder="you@team.com" />
                </div>
                <div className="field" style={{ marginTop: "10px" }}>
                    <label>Password</label>
                    <Input className="field-input" type="password" placeholder="Create a password" />
                </div>
                <Button
                    className="btn btn-green btn-full"
                    type="button"
                    style={{ marginTop: "16px" }}
                >
                    Create account
                </Button>
                <div style={{ marginTop: "10px", fontSize: "11px", color: "var(--text-t)" }}>
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </Card>
        </div>
    );
}
