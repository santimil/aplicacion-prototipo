import { useEffect, useState } from "react";

export function useMenu() {

  const [menuOpen, setMenuOpen] =
    useState(false);

  const openMenu = () => {
    setMenuOpen(true);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  useEffect(() => {

    const handleClickOutside = (e) => {

      if (
        !e.target.closest(".menu-container")
      ) {

        setMenuOpen(false);
      }
    };

    if (menuOpen) {

      window.addEventListener(
        "click",
        handleClickOutside
      );
    }

    return () => {

      window.removeEventListener(
        "click",
        handleClickOutside
      );
    };

  }, [menuOpen]);

  return {
    menuOpen,
    setMenuOpen,
    openMenu,
    closeMenu,
    toggleMenu
  };
}