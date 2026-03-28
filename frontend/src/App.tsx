import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { ChatProvider } from './context/ChatContext';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import logo from './assets/logo.svg';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ChatProvider>
        <Router>
          <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
            <header className="bg-white dark:bg-gray-800 shadow-md z-10">
              <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center">
                    <img className="h-8 w-auto" src={logo} alt="AI Support Bot" />
                    <span className="ml-3 font-bold text-xl text-gray-800 dark:text-white">
                      AI Support Center
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <NavLink
                      to="/"
                      className={({ isActive }) =>
                        `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                          isActive
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`
                      }
                    >
                      Chat
                    </NavLink>
                    <NavLink
                      to="/dashboard"
                      className={({ isActive }) =>
                        `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                          isActive
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`
                      }
                    >
                      Dashboard
                    </NavLink>
                  </div>
                </div>
              </nav>
            </header>
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<ChatPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ChatProvider>
    </LanguageProvider>
  );
};

export default App;