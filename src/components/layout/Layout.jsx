import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="app-scrollable bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white min-h-screen">
      <div className="flex">
        <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

        <main className="flex-1 flex flex-col">
          <Navbar onMenuToggle={() => setIsMobileMenuOpen(prev => !prev)} />

          <div className="content-scrollable p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;