import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Network, LogOut, Sparkles, Calendar as CalendarIcon } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { FocusCoach } from "./focus-coach";
import { userState } from "@/lib/userState";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Knowledge Graph", url: "/knowledge-graph", icon: Network },
  { title: "Calendar", url: "/calendar", icon: CalendarIcon },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow btn-glow shrink-0" />
          {!collapsed && <span className="font-semibold tracking-tight">GoalPilot</span>}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>AI</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <FocusCoach collapsed={collapsed} />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={async () => {
                const userId = userState.userId;
                if (!userId) {
                  toast.error("Not authenticated");
                  return;
                }
                try {
                  const res = await fetch(`http://localhost:8000/google-login?user_id=${userId}`, {
                    headers: userState.getAuthHeaders()
                  });
                  if (!res.ok) {
                    throw new Error("Failed to get authorization URL");
                  }
                  const data = await res.json();
                  if (data.url) {
                    window.open(data.url, "_blank");
                  } else {
                    toast.error("Google Login URL not found.");
                  }
                } catch (err) {
                  toast.error("Could not connect to backend server.");
                }
              }} 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <CalendarIcon className="h-4 w-4 text-primary-glow" />
              {!collapsed && <span>Connect Google Calendar</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sign out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
