import React from 'react';
import Link from 'next/link';

const Sidebar: React.FC = () => {
  return (
    <aside className="bg-gray-800 text-white w-64 h-screen p-4 fixed top-0 left-0">
      <h2 className="text-lg font-bold mb-4">Menu</h2>
      <ul className="space-y-2">
        <li>
          <Link href="/dashboard" className="block py-2 px-4 hover:bg-gray-700 rounded-md">
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/quests" className="block py-2 px-4 hover:bg-gray-700 rounded-md">
            Quests
          </Link>
        </li>
        <li>
          <Link href="/wallet" className="block py-2 px-4 hover:bg-gray-700 rounded-md">
            Wallet
          </Link>
        </li>
        <li>
          <Link href="/settings" className="block py-2 px-4 hover:bg-gray-700 rounded-md">
            Settings
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;