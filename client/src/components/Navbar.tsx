import { useState, useEffect } from "react";
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";

export default function Navbar() {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first
    const stored = localStorage.getItem("theme");
    if (stored) {
      const isDarkMode = stored === "dark";
      // Apply immediately to prevent flash
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return isDarkMode;
    }
    // Check system preference
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    return prefersDark;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleColorMode = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <div className="flex justify-center">
      <div className="bg-gray-400 dark:bg-gray-700 px-4 my-4 rounded w-[75%]">
        <div className="h-16 flex items-center justify-between ">
          {/* LEFT SIDE */}
          <div className="hidden sm:flex justify-center items-center gap-3">
            <p className="text-xl font-bold text-teal-700 dark:text-teal-300 drop-shadow-md hover:text-teal-500 dark:hover:text-teal-100 hover:scale-105 transition-all duration-200">
              Add A Task
            </p>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">
            <p className="text-lg font-medium">Daily Tasks</p>
            {/* Toggle Color Mode */}
            <button
              onClick={toggleColorMode}
              className="p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {isDark ? <LuSun size={20} /> : <IoMoon />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
