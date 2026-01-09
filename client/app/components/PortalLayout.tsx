"use client";

import { cn } from "@/lib/utils";
import {
  Building,
  Building2,
  CheckCircle2,
  DollarSign,
  FileText,
  Heart,
  Home,
  Menu,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface PortalLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
}

export function PortalLayout({
  children,
  activeTab = "snap",
}: PortalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "snap", label: "SNAP Application", icon: UtensilsCrossed },
    { id: "cash", label: "Cash Assistance", icon: DollarSign },
    { id: "medicaid", label: "Medicaid", icon: Heart },
    { id: "housing", label: "Housing Assistance", icon: Building },
    { id: "documents", label: "My Documents", icon: FileText },
    { id: "status", label: "Application Status", icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  NYC Benefits Portal
                </h1>
                <p className="text-sm text-slate-300">
                  New York City Human Resources Administration
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300 hidden sm:inline">
                Welcome, Applicant
              </span>
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-slate-700 text-white hover:bg-slate-800"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "bg-white border-r border-slate-200 transition-all duration-300 min-h-[calc(100vh-5rem)] shadow-sm",
            sidebarOpen ? "w-64" : "w-20"
          )}
        >
          <div className="p-4">
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              variant="ghost"
              size="icon"
              className="mb-4 w-full justify-start"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <a
                    key={tab.id}
                    href="#"
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary border-l-4 border-primary font-semibold"
                        : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        isActive ? "text-primary" : "text-slate-500"
                      )}
                    />
                    {sidebarOpen && <span>{tab.label}</span>}
                  </a>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
