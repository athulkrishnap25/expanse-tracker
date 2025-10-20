 import React from 'react';

import { FiLogOut, FiUser, FiMenu } from 'react-icons/fi';

import { signOut } from 'firebase/auth';

import { auth } from '../../firebase/config';

import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';



const Navbar = () => {

  const navigate = useNavigate();

  const { currentUser } = useAuth();
  const { toggleSidebar } = useUI();



  const handleLogout = async () => {

    await signOut(auth);

    navigate('/login');

  };



  return (

    <header className="flex items-center justify-between p-6 bg-gray-900/50 backdrop-blur-lg">

      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-2 rounded-md text-gray-300 hover:bg-gray-700/50"
          onClick={toggleSidebar}
          aria-label="Open sidebar"
        >
          <FiMenu />
        </button>
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">

        <div className="flex items-center gap-2 text-right">

          <div className='hidden md:block'>

            <p className="font-semibold text-white">{currentUser?.displayName || 'Admin User'}</p>

            <p className="text-xs text-gray-400">{currentUser?.email}</p>

          </div>

          <img

            src={currentUser?.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.displayName || 'A'}&background=0891b2&color=fff`}

            alt="User Avatar"

            className="w-10 h-10 rounded-full"

          />

        </div>

        <button

          onClick={handleLogout}

          className="p-2 text-gray-300 bg-gray-700/50 rounded-lg hover:bg-red-500/50 hover:text-white transition-colors duration-300"

        >

          <FiLogOut />

        </button>

      </div>

    </header>

  );

};



export default Navbar;