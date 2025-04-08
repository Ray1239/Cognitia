"use client"

import type React from "react"

import { useSearchParams } from "next/navigation"
import { useState } from "react"
import SidebarNavigation from "@/components/sidebar-navigation"
import { FloatingChatbot } from "@/components/FloatingChatbot"


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") || "overview"
  const [activeTab, setActiveTab] = useState(initialTab)

  return (
    <div className="flex">
      <SidebarNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col">
        <main className="flex-1 bg-[#F8F9FC]">{children}</main>
        <FloatingChatbot />
      </div>
    </div>
  )
}

