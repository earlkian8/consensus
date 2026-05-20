import { useState } from "react";
import {
    Package,
    CalendarDays,
    PlayCircle,
    ClipboardList,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    Leaf,
} from "lucide-react";

const NAV_ITEMS = [
    { key: "products",  label: "Products",     icon: Package },
    { key: "planning",  label: "Planning",     icon: CalendarDays },
    { key: "session",   label: "Session",      icon: PlayCircle },
    { key: "audit",     label: "Excess Audit", icon: ClipboardList },
    { key: "ai",        label: "AI Insights",  icon: Sparkles },
];

export default function Sidebar({ activePage, onNavigate }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={`relative flex flex-col shrink-0 h-screen sticky top-0 bg-card border-r transition-all duration-300 ${
                collapsed ? "w-16" : "w-52"
            }`}
        >
            {/* Logo */}
            <div className={`flex items-center gap-2.5 h-14 px-4 border-b ${collapsed ? "justify-center" : ""}`}>
                <div className="w-7.5 h-7.5 shrink-0 bg-linear-to-br from-primary to-teal-800 rounded-lg flex items-center justify-center text-white shadow-sm">
                    <Leaf size={14} />
                </div>
                {!collapsed && (
                    <span className="font-bold text-sm text-primary tracking-wide">Consensus</span>
                )}
            </div>

            {/* Nav items */}
            <nav className="flex flex-col gap-1 p-2 flex-1">
                {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
                    const active = activePage === key;
                    return (
                        <button
                            key={key}
                            type="button"
                            title={collapsed ? label : undefined}
                            onClick={() => onNavigate(key)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer w-full ${
                                collapsed ? "justify-center" : ""
                            } ${
                                active
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            }`}
                        >
                            <Icon size={17} className="shrink-0" />
                            {!collapsed && <span>{label}</span>}
                        </button>
                    );
                })}
            </nav>

            {/* Collapse toggle */}
            <button
                type="button"
                onClick={() => setCollapsed((v) => !v)}
                className="flex items-center justify-center h-10 border-t text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
                {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            </button>
        </aside>
    );
}
