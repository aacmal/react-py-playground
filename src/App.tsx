import { useCallback, useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./resize";
import { usePython } from "react-py";
import Play from "./play";
import Loading from "./loading";
import Sun from "./sun";
import Moon from "./moon";

export default function App() {
  const [value, setValue] = useState('print("Hello, World!")');
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isDesktop, setIsDesktop] = useState(false);

  const { runPython, stdout, stderr, isRunning, isLoading } = usePython();

  const handleChange = useCallback((val: string) => {
    setValue(val);
  }, []);

  const handleRun = () => {
    if (isRunning) return;
    runPython(value);
  };

  const handleThemeChange = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  // register the service worker
  useEffect(() => {
    console.log("Registering service worker");
    navigator.serviceWorker
      .register("/react-py-sw.js")
      .then((registration) =>
        console.log(
          "Service Worker registration successful with scope: ",
          registration.scope
        )
      )
      .catch((err) => console.log("Service Worker registration failed: ", err));
  }, []);

  // change theme effect
  useEffect(() => {
    const root = document.documentElement;

    if (theme === "light") {
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
    }
  }, [theme]);

  // handle window resize
  useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setIsDesktop(event.matches);
    }

    const result = matchMedia("(min-width: 1024px)");
    result.addEventListener("change", onChange);
    setIsDesktop(result.matches);

    return () => result.removeEventListener("change", onChange);
  }, []);

  if (isLoading) {
    return (
      <div className="grid h-screen place-items-center">
        <div className="flex items-center flex-col gap-2">
          <Loading className="!text-black" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 min-h-screen overflow-y-hidden bg-sky-100 dark:bg-slate-900">
      <section className="h-[calc(100vh_-_24px)] bg-white dark:bg-slate-800 rounded-xl overflow-hidden">
        <header className="p-5 items-center border-b flex justify-between bg-white dark:bg-slate-700">
          <h1 className="font-semibold dark:text-sky-50">Python Playground</h1>
          <div className="flex items-center gap-3">
            <button className="p-3" onClick={handleThemeChange}>
              {theme === "light" ? <Sun /> : <Moon />}
            </button>
            <button
              onClick={handleRun}
              className="p-3 rounded-lg shadow-lg shadow-sky-500/20 bg-sky-500"
            >
              {isRunning ? <Loading /> : <Play />}
            </button>
          </div>
        </header>
        <main className="px-0 lg:px-5 h-[calc(100%_-_85px)]">
          <ResizablePanelGroup
            className="h-full"
            direction={isDesktop ? "horizontal" : "vertical"}
          >
            <ResizablePanel>
              <CodeMirror
                extensions={[python()]}
                theme={theme === "light" ? githubLight : githubDark}
                value={value}
                onChange={handleChange}
              />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel className="p-3 font-light dark:text-sky-50">
              <pre>
                <code>
                  {stderr || stdout || "Output will be displayed here."}
                </code>
              </pre>
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      </section>
    </div>
  );
}
