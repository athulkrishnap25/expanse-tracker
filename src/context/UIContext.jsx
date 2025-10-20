import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen(s => !s);

  // Prevent background/body scroll when sidebar is open on mobile
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
      // also prevent overscroll bounce on iOS
      document.documentElement.style.overscrollBehavior = 'none';
    } else {
      document.body.style.overflow = prev || '';
      document.documentElement.style.overscrollBehavior = '';
    }
    return () => {
      document.body.style.overflow = prev || '';
      document.documentElement.style.overscrollBehavior = '';
    };
  }, [isSidebarOpen]);

  return (
    <UIContext.Provider value={{ isSidebarOpen, openSidebar, closeSidebar, toggleSidebar }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);
