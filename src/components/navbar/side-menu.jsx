import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bell,
  Bookmark,
  LandPlot,
  MessageSquareDot,
  PlaneTakeoff,
  Settings,
} from "lucide-react";

const LeftSideMenu = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const navItems = [
    {
      id: 1,
      label: "Tour Destinations",
      link: "/",
      icon: <LandPlot size={18} />,
    },
    {
      id: 2,
      label: "My Trips",
      link: "/trips",
      icon: <PlaneTakeoff size={18} />,
    },
    {
      id: 3,
      label: "Tour Agent",
      link: "/chat",
      icon: <MessageSquareDot size={18} />,
    },
    {
      id: 5,
      label: "Saved Destinations",
      link: "/saved-destinations",
      icon: <Bookmark size={18} />,
    },
    {
      id: 7,
      label: "Alerts",
      link: "/alerts",
      icon: <Bell size={18} />,
    },
    {
      id: 8,
      label: "Settings",
      link: "/settings",
      icon: <Settings size={18} />,
    },
  ];

  const isActiveRoute = (link) => {
    if (link === "/") {
      return pathname === "/";
    }

    return pathname === link || pathname.startsWith(`${link}/`);
  };

  return (
    <div className="w-[300px] p-6 h-screen border-r border-primary/10 sticky top-0 flex flex-col justify-between">
      <div className="space-y-6">
        <Link to="/" className="flex items-center gap-3" aria-label="tourtoise">
          <img src="/logo.png" className="h-8" alt="" />
          <span className="hidden min-w-0 sm:block">
            <span className="block pt-1 truncate text-2xl logo-font font-bold text-primary">
              tourtoise
            </span>
          </span>
        </Link>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = isActiveRoute(item.link);

            return (
              <Link
                key={item.id}
                to={item.link}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive ? "text-primary" : "hover:text-primary"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default LeftSideMenu;
