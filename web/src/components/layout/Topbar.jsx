const NAV_ITEMS = [
    { key: "products", label: "Products" },
    { key: "planning", label: "Planning" },
    { key: "session", label: "Session" },
    { key: "audit", label: "Excess Audit" },
    { key: "ai", label: "AI Insights" },
];

export default function Topbar({ activePage, onNavigate }) {
    return (
        <div className="topbar">
            <div className="logo">
                <div className="logo-icon">C</div>
                Consensus
            </div>
            <div className="logo-sub">SDG 12 - Responsible Production</div>
            <div className="nav-tabs">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        className={`nav-tab ${activePage === item.key ? "active" : ""}`}
                        onClick={() => onNavigate(item.key)}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
