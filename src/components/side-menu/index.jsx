import React from "react";
import { Link, useLocation } from "react-router-dom";

import { LayoutDashboard, Users, PlaneTakeoff, Settings } from "lucide-react";

const SideMenu = () => {
  const location = useLocation();

  const navItems = [
    {
      id: 1,
      label: "Overview",
      link: "/",
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: 2,
      label: "Users",
      link: "/users",
      icon: <Users size={18} />,
    },
    {
      id: 3,
      label: "Destinations",
      link: "/destinations",
      icon: <PlaneTakeoff size={18} />,
    },
    {
      id: 10,
      label: "Account Settings",
      link: "/settings",
      icon: <Settings size={18} />,
    },
  ];

  return (
    <div className="max-w-[240px] w-full h-screen bg-primary/10 p-6 pr-2 flex flex-col justify-between">
      <div className="space-y-6">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" className="h-12 w-12 object-contain" />
          <div>
            <h2 className="text-primary font-medium">tourtoise</h2>
            <p className="text-xs text-gray-500">Platform Management</p>
          </div>
        </Link>
        <ul className="space-y-1 w-full">
          {navItems.map((item) => {
            const isActive =
              item.link === "/"
                ? location.pathname === item.link
                : location.pathname.startsWith(item.link);

            return (
              <li key={item.id}>
                <Link
                  to={item.link}
                  className={`flex items-center font-medium gap-3 px-4 py-3 w-full text-sm rounded-full transition-all
                  ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-primary/75 hover:bg-primary/10 hover:text-primary"
                  }
                `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="bg-primary/10 p-3 rounded-lg flex items-center gap-2">
        <img
          src="https://media.licdn.com/dms/image/v2/D5603AQFNKfEBpcynJw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1722787149506?e=2147483647&v=beta&t=snYVYV9rYKnqQVnkWUAjtnQO1n_d6auaquNfuSvT3fg"
          className="h-9 w-9 rounded-full"
        />
        <div className="flex-1">
          <h2 className="text-sm text-emerald-800 font-medium">
            Shahtaz Rahman
          </h2>
          <p className="text-xs text-primary">Admin Manager</p>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;
