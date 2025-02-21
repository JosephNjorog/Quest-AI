import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              © {new Date().getFullYear()} QuestMind AI
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-sm text-gray-600">
              Built with <Heart className="inline w-4 h-4 text-red-500" /> on Avalanche
            </span>
          </div>
          
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-sm text-gray-600 hover:text-blue-600">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-blue-600">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-blue-600">
              Documentation
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-blue-600">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;