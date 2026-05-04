"use client";

import { MdDashboard, MdManageAccounts } from "react-icons/md";
import { GrTransaction } from "react-icons/gr";
import { IoAnalytics, IoSettings } from "react-icons/io5";
import { RiShoppingCartLine } from "react-icons/ri";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LuLogOut } from "react-icons/lu";
import Image from "next/image";

const menus = [
  { title: "Dashboard", icon: <MdDashboard />, href: "/admin/dashboard" },
  { title: "Products", icon: <RiShoppingCartLine />, href: "/admin/products" },
  { title: "Accounts", icon: <MdManageAccounts />, href: "/admin/accounts" },
  { title: "Transactions", icon: <GrTransaction />, href: "/admin/transactions" },
  { title: "Analytics", icon: <IoAnalytics />, href: "/admin/analytics" },
  { title: "Settings", icon: <IoSettings />, href: "/admin/settings" },
];

const Sidebar = () => {
  const pathName = usePathname();
  return (
    <div className="bg-white w-[300px] min-h-screen p-4 shrink-0">
      <div className="flex items-center gap-4">
        <Image
          className="size-12 rounded-lg"
          src="/logo.png"
          alt="logo"
          width={48}
          height={48}
        />
        <h2 className="text-[20px] font-semibold text-slate-900">Volta Admin</h2>
      </div>
      <ul className="space-y-4 mt-6">
        {menus.map((menu) => (
          <Link
            key={menu.title}
            href={menu.href}
            className={`flex gap-2 items-center p-4 rounded-lg cursor-pointer hover:bg-pink hover:text-white ${
              pathName === menu.href ? "bg-pink text-white" : "bg-gray-200"
            }`}
          >
            <div className="text-[20px]">{menu.icon}</div>
            <p>{menu.title}</p>
          </Link>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/admin/dashboard" })}
        className="mt-8 w-full flex gap-2 items-center p-4 rounded-lg cursor-pointer border border-red-200 text-red-600 hover:bg-red-50 transition"
      >
        <div className="text-[20px]">
          <LuLogOut />
        </div>
        <p>Logout</p>
      </button>
    </div>
  );
};

export default Sidebar;
