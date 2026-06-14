import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Network, LogOut, Sparkles, Calendar as CalendarIcon, Plus, Target, Settings, Loader2, Kanban } from "lucide-react";
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
import { getApiUrl } from "@/lib/api-config";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Knowledge Graph", url: "/knowledge-graph", icon: Network },
  { title: "Kanban Board", url: "/kanban", icon: Kanban },
  { title: "Calendar", url: "/calendar", icon: CalendarIcon },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { userId, token, activeGoalId, allMissions } = useUserState();

  // Persona settings states
  const [isOpenPersonaSettings, setIsOpenPersonaSettings] = useState(false);
  const [profileData, setProfileData] = useState({
    display_name: "",
    focus_area: "",
    daily_hours: 2,
    work_style: "Deep Work",
    user_level: "Beginner",
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchProfile = async () => {
    if (!userId) return;
    setLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, focus_area, current_focus, daily_hours, work_style, user_level")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProfileData({
          display_name: data.display_name || "",
          focus_area: data.focus_area || data.current_focus || "",
          daily_hours: data.daily_hours || 2,
          work_style: data.work_style || "Deep Work",
          user_level: data.user_level || "Beginner",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile data.");
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (isOpenPersonaSettings) {
      fetchProfile();
    }
  }, [isOpenPersonaSettings]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSavingProfile(true);
    try {
      const res = await fetch(getApiUrl("complete-onboarding"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...userState.getAuthHeaders(),
        },
        body: JSON.stringify({
          user_id: userId,
          full_name: profileData.display_name,
          preferences: {
            focus_area: profileData.focus_area,
            daily_hours: Number(profileData.daily_hours),
            work_style: profileData.work_style,
            user_level: profileData.user_level,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to update persona.");
      }

      toast.success("Persona updated successfully!");
      setIsOpenPersonaSettings(false);
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save persona settings.");
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    if (!userId || !token) return;
    const fetchGoals = async () => {
      try {
        const res = await fetch(getApiUrl("user-goals"), {
          headers: userState.getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          userState.setAllMissions(data);
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
              {allMissions.map((g) => (
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
                  const res = await fetch(getApiUrl(`google-login?supabase_token=${token}`), {
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
            <SidebarMenuButton 
              onClick={() => setIsOpenPersonaSettings(true)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-4 w-4 text-primary-glow" />
              {!collapsed && <span>Persona Settings</span>}
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

      <Dialog open={isOpenPersonaSettings} onOpenChange={setIsOpenPersonaSettings}>
        <DialogContent className="glass-strong border border-border text-foreground max-w-md">
          <form onSubmit={handleSaveProfile}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Settings className="h-6 w-6 text-primary-glow" /> Persona Settings
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Fine-tune your personal execution engine settings. Changing these settings will update how the AI Coach schedules and scales your roadmap tasks.
              </DialogDescription>
            </DialogHeader>

            {loadingProfile ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-primary-glow" />
                <span>Loading profile details...</span>
              </div>
            ) : (
              <div className="py-6 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="display-name" className="text-sm font-medium">Full Name</Label>
                  <Input
                    id="display-name"
                    value={profileData.display_name}
                    onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                    required
                    className="bg-background/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="focus-area" className="text-sm font-medium">Focus Area</Label>
                  <Input
                    id="focus-area"
                    value={profileData.focus_area}
                    onChange={(e) => setProfileData({ ...profileData, focus_area: e.target.value })}
                    required
                    className="bg-background/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="daily-hours" className="text-sm font-medium">Daily Hours Quota</Label>
                  <Input
                    id="daily-hours"
                    type="number"
                    min="1"
                    max="24"
                    value={profileData.daily_hours}
                    onChange={(e) => setProfileData({ ...profileData, daily_hours: Number(e.target.value) })}
                    required
                    className="bg-background/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="work-style" className="text-sm font-medium">Work Style</Label>
                  <Select
                    value={profileData.work_style}
                    onValueChange={(val) => setProfileData({ ...profileData, work_style: val })}
                  >
                    <SelectTrigger id="work-style" className="bg-background/40 w-full">
                      <SelectValue placeholder="Select work style" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong text-foreground border-border">
                      <SelectItem value="Deep Work">Deep Work</SelectItem>
                      <SelectItem value="Pomodoro">Pomodoro</SelectItem>
                      <SelectItem value="Time Boxing">Time Boxing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="user-level" className="text-sm font-medium">Experience Level</Label>
                  <Select
                    value={profileData.user_level}
                    onValueChange={(val) => setProfileData({ ...profileData, user_level: val })}
                  >
                    <SelectTrigger id="user-level" className="bg-background/40 w-full">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong text-foreground border-border">
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpenPersonaSettings(false)}
                disabled={savingProfile}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loadingProfile || savingProfile}
                className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground btn-glow"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
