import React from 'react';

import { NavLink, Link } from 'react-router-dom';

import { FiGrid, FiBarChart2, FiShoppingBag, FiSettings, FiDollarSign, FiPlus, FiX } from 'react-icons/fi';

import Logo from '../ui/Logo';
import { useUI } from '../../context/UIContext';



const Sidebar = () => {

  // We are adding all the navigation items back here

  const navItems = [

    { icon: <FiGrid />, name: 'Dashboard', path: '/' },

    { icon: <FiShoppingBag />, name: 'Products', path: '/products' },

    { icon: <FiBarChart2 />, name: 'Reports', path: '/reports' },

    { icon: <FiDollarSign />, name: 'Expenses', path: '/expenses' },

    { icon: <FiSettings />, name: 'Settings', path: '/settings' },

  ];




  const { isSidebarOpen, closeSidebar } = useUI();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="w-64 bg-gray-900/70 backdrop-blur-lg p-6 flex-col hidden lg:flex">
        <div className="flex items-center gap-3 mb-6">
          <Logo />
          <h1 className="text-xl font-bold text-white">Shadozz</h1>
        </div>

        <Link
          to="/new-sale"
          className="flex items-center justify-center gap-2 w-full mb-6 py-2 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition duration-300"
        >
          <FiPlus />
          New Sale
        </Link>

        <nav className="flex flex-col gap-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-cyan-500/20 hover:text-white transition-colors duration-300 ${isActive ? 'bg-cyan-500/20 text-white' : ''}`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile slide-in sidebar */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!isSidebarOpen}
      >
        {/* overlay */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeSidebar}
        />

        {/* panel */}
        <aside className={`absolute left-0 top-0 bottom-0 w-72 bg-gray-900/90 backdrop-blur-lg p-6 transform transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Logo />
              <h1 className="text-xl font-bold text-white">Shadozz</h1>
            </div>
            <button onClick={closeSidebar} aria-label="Close" className="p-2 rounded-md text-gray-300 hover:bg-gray-700/50">
              <FiX />
            </button>
          </div>

          <Link to="/new-sale" onClick={closeSidebar} className="flex items-center justify-center gap-2 w-full mb-6 py-2 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition duration-300">
            <FiPlus />
            New Sale
          </Link>

          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg text-gray-300 hover:bg-cyan-500/20 hover:text-white transition-colors duration-300 ${isActive ? 'bg-cyan-500/20 text-white' : ''}`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
      </div>
    </>
  );

};



export default Sidebar;