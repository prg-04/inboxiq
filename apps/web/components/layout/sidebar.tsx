"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, Settings, MessageCircle, Users } from "lucide-react";

const sidebarItems = [
  {
    name: "Inbox",
    href: "/inbox",
    icon: Inbox,
  },
  {
    name: "Channels",
    href: "/channels",
    icon: MessageCircle,
  },
  {
    name: "Team",
    href: "/team",
    icon: Users,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-100 border-r border-gray-200 h-full p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">InboxIQ</h1>
      </div>
      <nav>
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center p-3 rounded-lg mb-2 transition-colors duration-200
                ${
                  isActive
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-gray-200 text-gray-600"
                }
              `}
            >
              <Icon className="mr-3" size={20} />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
