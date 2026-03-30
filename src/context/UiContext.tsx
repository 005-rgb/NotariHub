import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { FolderListItem } from '../types';

interface UiContextType {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isLivePulseOpen: boolean;
  setIsLivePulseOpen: (open: boolean) => void;
  isSubmissionModalOpen: boolean;
  setIsSubmissionModalOpen: (open: boolean) => void;
  isConsumerDrawerOpen: boolean;
  setIsConsumerDrawerOpen: (open: boolean) => void;
  selectedConsumer: FolderListItem | null;
  setSelectedConsumer: (consumer: FolderListItem | null) => void;
}

const UiContext = createContext<UiContextType | undefined>(undefined);

export const UiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLivePulseOpen, setIsLivePulseOpen] = useState(true);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isConsumerDrawerOpen, setIsConsumerDrawerOpen] = useState(false);
  const [selectedConsumer, setSelectedConsumer] = useState<FolderListItem | null>(null);

  const value = useMemo(() => ({
    isSidebarOpen,
    setIsSidebarOpen,
    isLivePulseOpen,
    setIsLivePulseOpen,
    isSubmissionModalOpen,
    setIsSubmissionModalOpen,
    isConsumerDrawerOpen,
    setIsConsumerDrawerOpen,
    selectedConsumer,
    setSelectedConsumer,
  }), [
    isSidebarOpen,
    isLivePulseOpen,
    isSubmissionModalOpen,
    isConsumerDrawerOpen,
    selectedConsumer,
  ]);

  return (
    <UiContext.Provider value={value}>
      {children}
    </UiContext.Provider>
  );
};

export const useUi = () => {
  const context = useContext(UiContext);
  if (!context) {
    throw new Error('useUi must be used within a UiProvider');
  }
  return context;
};
