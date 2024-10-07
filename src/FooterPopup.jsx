import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const FooterPopup = ({ isDarkMode, title, onClose, children }) => {
  const classes = {
    container: `fixed inset-0 flex items-center justify-center z-50 ${
      isDarkMode ? "bg-black/50" : "bg-white/50"
    } backdrop-blur-sm`,
    content: `bg-${isDarkMode ? "gray-800" : "white"} p-8 rounded-lg shadow-lg relative w-full max-w-3xl`,
    closeButton: `absolute top-4 right-4 text-${isDarkMode ? "gray-400" : "gray-500"} hover:text-${
      isDarkMode ? "gray-300" : "gray-700"
    }`,
    title: `text-2xl font-semibold mb-6 text-${isDarkMode ? "white" : "gray-800"}`,
    text: `text-${isDarkMode ? "gray-300" : "gray-600"}`,
  };

  // Animation states
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300);
  };

  const handleClickOutside = (event) => {
    const popupContent = document.querySelector(`.${classes.content}`);
    if (event.target !== popupContent && !popupContent.contains(event.target)) {
      handleClose();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div
      className={`${classes.container} ${!isOpen ? "opacity-0 pointer-events-none" : ""}`}
    >
      <div
        className={`${classes.content} ${!isOpen ? "scale-95 opacity-0" : ""} transition-all duration-300 ease-out`}
      >
        <button className={classes.closeButton} onClick={handleClose}>
          <X size={24} />
        </button>
        <h2 className={classes.title}>{title}</h2>
        <div className={classes.text}>{children}</div>
      </div>
    </div>
  );
};

export default FooterPopup;