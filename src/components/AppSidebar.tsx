"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gift,
  Home,
  LogOut,
  UserCircle,
  Users,
  Settings,
  PanelLeft,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
  SidebarTrigger,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from "./Logo";
import { Button } from "./ui/button";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/wishlist", label: "Mi Lista de Deseos", icon: Gift, badge: "3" },
  { href: "/participants", label: "Participantes", icon: Users },
  { href: "/profile", label: "Mi Perfil", icon: UserCircle },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <Logo />
          <SidebarTrigger className="hidden md:flex" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={
                  item.href === "/dashboard"
                    ? pathname === item.href
                    : pathname.startsWith(item.href)
                }
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                  {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2">
          <Avatar className="size-8">
            <AvatarImage src="https://picsum.photos/seed/user-avatar/40/40" data-ai-hint="person face" />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-sidebar-foreground">Ana</span>
            <span className="text-xs text-sidebar-foreground/70">
              ana@example.com
            </span>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Cerrar Sesión">
              <Link href="/">
                <LogOut />
                <span>Cerrar Sesión</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

const MobileHeader = () => {
  return (
    <header className="flex md:hidden items-center justify-between p-2 border-b">
      <Logo />
      <SidebarTrigger asChild>
        <Button size="icon" variant="ghost">
          <PanelLeft />
        </Button>
      </SidebarTrigger>
    </header>
  );
};

export { MobileHeader };
