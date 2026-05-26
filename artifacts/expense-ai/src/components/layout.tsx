import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Receipt, LineChart, Lightbulb } from "lucide-react";
import { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const items = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Expenses", url: "/expenses", icon: Receipt },
    { title: "Analytics", url: "/analytics", icon: LineChart },
    { title: "Recommendations", url: "/recommendations", icon: Lightbulb },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-[100dvh] w-full bg-background">
        <Sidebar variant="sidebar" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/70 font-semibold uppercase tracking-wider text-xs px-4 py-4">
                SpendSmart AI
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={location === item.url} className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground">
                        <Link href={item.url} className="flex items-center gap-3 px-4 py-2 w-full text-sm font-medium">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <header className="h-14 flex items-center px-4 border-b bg-card">
            <SidebarTrigger className="md:hidden" />
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto max-w-6xl w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
