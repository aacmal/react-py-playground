import { KeyboardEvent, useCallback, useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./resize";
import { usePython } from "react-py";
import Play from "./icons/play";
import Loading from "./icons/loading";
import Sun from "./icons/sun";
import Moon from "./icons/moon";

export default function App() {
  const [value, setValue] = useState('print("Hello, World!")');
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isDesktop, setIsDesktop] = useState(false);
  const [showOutput, setShowOutput] = useState(true);

  const {
    runPython,
    stdout,
    stderr,
    isRunning,
    isLoading,
    prompt,
    isAwaitingInput,
    sendInput,
    interruptExecution,
  } = usePython();

  const handleChange = useCallback((val: string) => {
    setValue(val);
  }, []);

  const handleRun = () => {
    if (isRunning) return;
    runPython(value);
    setShowOutput(true);
  };

  const handleThemeChange = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  const handleSubmitPrompt = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendInput(e.currentTarget.value);
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
              disabled={isRunning || isLoading}
              onClick={handleRun}
              className="p-3 rounded-lg disabled:cursor-not-allowed disabled:bg-sky-400 shadow-lg shadow-sky-500/20 bg-sky-500"
            >
              {isLoading ? (
                <Loading />
              ) : isRunning ? (
                <span className="flex items-center text-sky-50 gap-2">
                  <Loading />
                  <span className="text-xs font-medium">Running</span>
                </span>
              ) : (
                <Play />
              )}
            </button>
          </div>
        </header>
        <main className="px-0 lg:px-5 lg:pr-0 h-[calc(100%_-_85px)]">
          <ResizablePanelGroup
            className="h-full"
            direction={isDesktop ? "horizontal" : "vertical"}
          >
            <ResizablePanel className="relative">
              {isRunning && (
                <button
                  onClick={() => {
                    interruptExecution();
                    setShowOutput(false);
                  }}
                  className="px-3 py-1 font-medium text-sm rounded absolute right-3 top-3 z-50 shadow-red-500/40 shadow-lg bg-red-500 text-white"
                >
                  Stop
                </button>
              )}
              <CodeMirror
                className="text-base"
                extensions={[python()]}
                theme={theme === "light" ? githubLight : githubDark}
                value={value}
                onChange={handleChange}
              />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel className="font-light dark:text-sky-50">
              <section className="h-full overflow-y-auto">
                <header className="flex p-3 dark:border-slate-500 justify-between border-b items-center">
                  <h1 className="font-semibold ">Output</h1>
                  <button
                    onClick={() => setShowOutput(false)}
                    disabled={isLoading}
                    className="py-1 px-3 overflow-x-hidden disabled:cursor-not-allowed font-medium rounded-lg border dark:border-l-slate-200 shadow"
                  >
                    Clear
                  </button>
                </header>
                <pre className="p-3 overflow-x-auto">
                  {isLoading ? (
                    <code>
                      <Loading className="!text-black dark:!text-white inline" />{" "}
                      Setting up...
                      {/* Development preview */}
                      {/* <span className="block">
                        <span>Input your number 😎 :</span>
                        <input
                          // Adjust width of input to fit the text
                          onChange={(e) => {
                            e.target.style.width = `${
                              e.target.value.length + 2
                            }ch`;
                          }}
                          autoFocus
                          className="outline-none bg-red-300 px-2 w-7 bg-transparent"
                          type="text"
                          onKeyDown={handleSubmitPrompt}
                        />
                      </span> */}
                    </code>
                  ) : showOutput ? (
                    <code>
                      {stderr || stdout || "Output will be displayed here."}
                      {isAwaitingInput && (
                        <span className="block">
                          <span>{prompt}</span>
                          <input
                            // Adjust width of input to fit the text
                            onChange={(e) => {
                              e.target.style.width = `${
                                e.target.value.length + 2
                              }ch`;
                            }}
                            autoFocus
                            className="outline-none px-2 w-7 bg-transparent"
                            type="text"
                            onKeyDown={handleSubmitPrompt}
                          />
                        </span>
                      )}
                    </code>
                  ) : (
                    <></>
                  )}
                </pre>
              </section>
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      </section>
    </div>
  );
}
