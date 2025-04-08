"use client"

import { useState } from "react"
import { FloatingChatButton } from "./FloatingChatButton"
import { ChatInterface } from "./chat-interface"


export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleChat = () => setIsOpen(!isOpen)

  return (
    <>
      <FloatingChatButton onClick={toggleChat} isOpen={isOpen} />
      {isOpen && <ChatInterface />}
    </>
  )
}

