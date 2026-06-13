import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Network, LogOut, Sparkles, Calendar as CalendarIcon, Plus, Target } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect, useState } from "react";

import { FocusCoach } from "./focus-coach";
import { userState, useUserState } from "@/lib/userState";

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

  const { userId, token, activeGoalId } = useUserState();
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    if (!userId || !token) return;
    const fetchGoals = async () => {
      try {
        const res = await fetch("http://localhost:8000/user-goals", {
          headers: userState.getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          setGoals(data);
          // Auto-set the active goal to the first one if not set
          if (data.length > 0 && !activeGoalId) {
            const defaultGoal = data[0];
            userState.setActiveGoalId(defaultGoal.id);
            await supabase
              .from("profiles")
              .update({ last_active_goal_id: defaultGoal.id })
              .eq("id", userId);
          }
        }
      } catch (e) {
        console.error("Failed to load goals in sidebar:", e);
      }
    };
    fetchGoals();
  }, [userId, token, activeGoalId]);

  const handleSelectGoal = async (goalId: string) => {
    userState.setActiveGoalId(goalId);
    if (userId) {
      const { error } = await supabase
        .from("profiles")
        .update({ last_active_goal_id: goalId })
        .eq("id", userId);
      if (error) {
        toast.error("Failed to update active goal session.");
      } else {
        toast.success("Active mission updated!");
      }
    }
  };

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

        {/* My Missions switcher */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex justify-between items-center pr-2">
            <span>My Missions</span>
            {!collapsed && (
              <button
                type="button"
                className="h-5 w-5 rounded hover:bg-white/10 flex items-center justify-center cursor-pointer border-0 bg-transparent text-primary-glow"
                onClick={() => window.location.href = "/onboarding?new=true"}
                title="Create New Mission"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {goals.map((g) => (
                <SidebarMenuItem key={g.id}>
                  <SidebarMenuButton
                    isActive={activeGoalId === g.id}
                    onClick={() => handleSelectGoal(g.id)}
                    className="w-full text-left justify-start gap-2 px-3 py-1.5 cursor-pointer"
                  >
                    <Target className={`h-4 w-4 shrink-0 ${activeGoalId === g.id ? "text-primary-glow animate-pulse" : "text-muted-foreground"}`} />
                    {!collapsed && <span className="truncate">{g.title}</span>}
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
                const token = userState.token;
                if (!token) {
                  toast.error("Not authenticated");
                  return;
                }
                try {
                  const res = await fetch(`http://localhost:8000/google-login?supabase_token=${token}`, {
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
