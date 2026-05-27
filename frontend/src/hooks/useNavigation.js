import { useState } from "react";

export function useNavigation() {

  const [view, setView] = useState("kanban");
  const [history, setHistory] = useState([]);

  const goToView = (nextView) => {

    setHistory(prev => [...prev, view]);

    setView(nextView);
  };

  const goBack = () => {

    setHistory(prev => {

      if (prev.length === 0) return prev;

      const newHistory = [...prev];

      const previousView = newHistory.pop();

      setView(previousView);

      return newHistory;
    });
  };

  const resetNavigation = (nextView = "kanban") => {

    setHistory([]);

    setView(nextView);
  };

  const replaceView = (nextView) => {
    setView(nextView);
  };

  return {
    view,
    setView,
    goToView,
    goBack,
    resetNavigation
  };
}