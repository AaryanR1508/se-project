import React from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = React.useState(
    () => localStorage.getItem("theme") === "dark"
  );

  React.useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="px-3 py-1 rounded-lg border shadow-sm bg-white dark:bg-slate-800 dark:text-gray-200"
    >
      {dark ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
