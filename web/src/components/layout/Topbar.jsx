const NAV_ITEMS = [
    { key: "products", label: "Products" },
    { key: "planning", label: "Planning" },
    { key: "session", label: "Session" },
    { key: "audit", label: "Excess Audit" },
    { key: "ai", label: "AI Insights" },
];

export default function Topbar({ activePage, onNavigate }) {
    return (
        <div className="flex items-center gap-2.5 h-14.5 px-5 bg-background/90 border-b sticky top-0 z-100 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-2 font-bold text-base text-primary tracking-wide">
                <div className="w-7.5 h-7.5 bg-linear-to-br from-primary to-teal-800 rounded-lg flex items-center justify-center text-white text-[13px] shadow-sm">
                    C
                </div>
                Consensus
            </div>
            <div className="flex flex-wrap gap-1.5 ml-auto">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        className={`px-3.5 py-1.5 rounded-full border text-xs cursor-pointer font-semibold transition-all ${activePage === item.key
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-transparent border-transparent text-muted-foreground hover:bg-secondary"
                            }`}
                        onClick={() => onNavigate(item.key)}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </div>
    );
}