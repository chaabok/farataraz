"use client";

import React, { createContext, useContext, useState } from "react";
import { HelpModal } from "./ui/HelpModal";

interface HelpContextType {
  openHelp: (topic: string, title?: string) => void;
  closeHelp: () => void;
}

const HelpContext = createContext<HelpContextType>({
  openHelp: () => {},
  closeHelp: () => {},
});

export const useHelp = () => useContext(HelpContext);

export function HelpProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");

  const openHelp = (newTopic: string, newTitle?: string) => {
    setTopic(newTopic);
    setTitle(newTitle || newTopic);
    setIsOpen(true);
  };

  const closeHelp = () => {
    setIsOpen(false);
  };

  return (
    <HelpContext.Provider value={{ openHelp, closeHelp }}>
      {children}
      <HelpModal isOpen={isOpen} onClose={closeHelp} topic={topic} title={title} />
    </HelpContext.Provider>
  );
}
