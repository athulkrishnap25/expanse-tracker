 import React from 'react';

import { NavLink, Link } from 'react-router-dom';

import { FiGrid, FiBarChart2, FiShoppingBag, FiSettings, FiDollarSign, FiPlus } from 'react-icons/fi';

import Logo from '../ui/Logo';



const Sidebar = () => {

  // We are adding all the navigation items back here

  const navItems = [

    { icon: <FiGrid />, name: 'Dashboard', path: '/' },

    { icon: <FiShoppingBag />, name: 'Products', path: '/products' },

    { icon: <FiBarChart2 />, name: 'Reports', path: '/reports' },

    { icon: <FiDollarSign />, name: 'Expenses', path: '/expenses' },

    { icon: <FiSettings />, name: 'Settings', path: '/settings' },

  ];



  return (

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

  );

};



export default Sidebar;