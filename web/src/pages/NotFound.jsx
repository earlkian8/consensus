import { Link } from "react-router-dom";
import { Button } from "@/components/shadcnUI/button";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
            <div className="text-center max-w-105 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-[120px] font-extrabold text-primary/10 tracking-tighter leading-none mb-4 select-none">
                    404
                </div>
                <h1 className="text-xl font-bold text-foreground mb-2">
                    Page not found
                </h1>
                <p className="text-[13px] text-muted-foreground mb-8 leading-relaxed">
                    The page you are looking for doesn't exist, has been moved, or you don't have access to it.
                </p>

                <Button asChild className="w-full sm:w-auto font-semibold shadow-sm">
                    <Link to="/dashboard">
                        Return to Dashboard
                    </Link>
                </Button>
            </div>
        </div>
    );
}