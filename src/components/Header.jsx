import { Link } from "react-router-dom";
import { MdLightMode, MdWallet } from "react-icons/md";
import { FaMoon, FaVoteYea } from "react-icons/fa";
import { useEffect, useState } from "react";
import { truncate, useGlobalState } from "../store";
import { connectWallet } from "../Blockchain.services";

const Header = () => {
  const [theme, setTheme] = useState(localStorage.theme || "dark");
  const themeColor = theme === "dark" ? "light" : "dark";
  const darken = theme === "dark" ? true : false;
  const [connectedAccount] = useGlobalState("connectedAccount");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(themeColor);
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [themeColor, theme]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLight = () => {
    const root = window.document.documentElement;
    root.classList.remove(themeColor);
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
    setTheme(themeColor);
  };

  return (
    <header className="sticky top-0 z-50">
      <nav
        className={`w-full py-3 px-6 flex items-center justify-between transition-all duration-300 ${
          scrolled
            ? "bg-dao-surface/90 backdrop-blur-md border-b border-dao-border shadow-lg shadow-black/30"
            : "bg-transparent"
        }`}
      >
        {/* Logo */}
        <Link to={"/"} className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-md opacity-40 group-hover:opacity-70 transition-opacity rounded-full"></div>
            <div className="relative w-9 h-9 rounded-full bg-accent-gradient flex items-center justify-center">
              <FaVoteYea className="text-white text-base" />
            </div>
          </div>
          <div className="hidden md:flex flex-col">
            <span className="font-bold text-lg leading-tight gradient-text">
              PTIT Dominion
            </span>
            <span className="text-xs text-gray-500 font-medium tracking-wider uppercase">
              DAO · Sepolia
            </span>
          </div>
        </Link>

        {/* Right controls */}
        <div className="flex items-center space-x-3">
          {/* Theme toggle */}
          <button
            onClick={toggleLight}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-dao-border hover:border-dao-accent/50 bg-dao-card/60 hover:bg-cyan-500/10 transition-all duration-200"
            title="Đổi giao diện"
          >
            {darken ? (
              <MdLightMode className="text-amber-400" size={18} />
            ) : (
              <FaMoon className="text-cyan-400" size={16} />
            )}
          </button>

          {/* Wallet button */}
          {connectedAccount ? (
            <div className="flex items-center space-x-2 bg-dao-card/90 border border-emerald-500/40 px-3.5 py-1.5 rounded-full shadow-lg shadow-emerald-950/30">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <MdWallet className="text-emerald-400" size={16} />
              <span className="text-emerald-400 font-mono text-sm font-medium">
                {truncate(connectedAccount, 4, 4, 11)}
              </span>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="btn-glow flex items-center space-x-2 px-4 py-2 rounded-full text-white font-semibold text-sm cursor-pointer"
            >
              <MdWallet size={16} />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
