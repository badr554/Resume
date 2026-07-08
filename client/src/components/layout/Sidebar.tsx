import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { initialsOf } from "../../utils/helpers";

const NAV_ITEMS = [
  { id: "dashboard", label: "My Resumes", path: "/dashboard" },
  { id: "templates", label: "Templates", path: "/templates" },
  { id: "cover-letters", label: "Cover Letters", path: "/cover-letter" },
  { id: "ats", label: "ATS Checker", path: "/ats-checker" },
  { id: "settings", label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="w-[248px] shrink-0 bg-sidebar flex flex-col px-[14px] py-5 box-border">
      <div className="flex items-center gap-[10px] pt-[6px] px-[10px] pb-[22px]">
        <div className="w-[30px] h-[30px] rounded-lg bg-primary flex items-center justify-center text-white font-extrabold text-sm shrink-0">
          R
        </div>
        <span className="text-white font-bold text-[15.5px] tracking-[-0.01em]">ResumeAI</span>
      </div>

      <nav className="flex flex-col gap-[2px] mt-2">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <div
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-[11px] px-3 py-[9px] rounded-lg cursor-pointer ${
                active ? "bg-[rgba(59,130,246,0.16)]" : "hover:bg-[rgba(255,255,255,0.06)]"
              }`}
            >
              <div
                className={`w-[6px] h-[6px] rounded-full shrink-0 ${
                  active ? "bg-primary" : "bg-[rgba(255,255,255,0.35)]"
                }`}
              />
              <span
                className={`text-[13.5px] ${
                  active ? "font-semibold text-white" : "font-medium text-[rgba(255,255,255,0.65)]"
                }`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-[rgba(255,255,255,0.08)] flex items-center gap-[10px]">
        <div className="w-[30px] h-[30px] rounded-full bg-[#334155] flex items-center justify-center text-[#E2E8F0] font-semibold text-xs shrink-0">
          {user ? initialsOf(user.name) : "?"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-white text-[13px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
            {user?.name ?? ""}
          </div>
          <div className="text-[rgba(255,255,255,0.45)] text-[11.5px]">Pro Plan</div>
        </div>
        <button
          onClick={() => {
            void logout();
            navigate("/login");
          }}
          title="Log out"
          className="text-[rgba(255,255,255,0.45)] hover:text-white bg-transparent border-none cursor-pointer p-1"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
