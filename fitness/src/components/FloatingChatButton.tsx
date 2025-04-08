"use client"

import { useState } from "react"
import { MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FloatingChatButtonProps {
  onClick: () => void
  isOpen: boolean
}

export function FloatingChatButton({ onClick, isOpen }: FloatingChatButtonProps) {
  return (
    <Button className="fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg" onClick={onClick}>
      {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
    </Button>
  )
}

