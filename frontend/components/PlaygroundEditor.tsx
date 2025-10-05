"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
// The Monaco Editor is replaced with a standard textarea to resolve the dependency issue.
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Circle,
  Smartphone,
  Tablet,
  Monitor,
  FilePlus,
  Trash2,
  Folder,
  File as FileIcon,
  Play,
  Download,
  GitMerge,
} from "lucide-react";
import { EmulatorStream } from "./EmulatorStream";

// --- Type Definitions ---
export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  content?: string;
  children?: FileNode[];
}

// --- Constants ---
const DEFAULT_FILES: FileNode[] = [
  {
    id: "folder-src", // Placeholder ID
    name: "src",
    type: "folder",
    path: "src",
    children: [
      {
        id: "file-app-js", // Placeholder ID
        name: "App.js",
        type: "file",
        path: "src/App.js",
        content: `import React from 'react';
// ... (rest of the content)
`,
      },
    ],
  },
];

const DEVICE_CONFIG = {
  iphone: {
    "iPhone 16 Pro Max": {
      width: 345,
      height: 715,
      radius: "3.25rem",
      notch: "dynamic-island",
    },
    "iPhone 15": {
      width: 320,
      height: 655,
      radius: "3rem",
      notch: "dynamic-island",
    },
    "iPhone SE": {
      width: 300,
      height: 535,
      radius: "1.5rem",
      notch: "classic",
    },
  },
  android: {
    "Pixel 9 Pro": {
      width: 330,
      height: 680,
      radius: "1.75rem",
      notch: "punch-hole",
    },
    "Galaxy S25 Ultra": {
      width: 345,
      height: 710,
      radius: "1.25rem",
      notch: "punch-hole",
    },
  },
  web: {
    "Laptop (1366x768)": {
      width: 683,
      height: 384,
      radius: "0.5rem",
      notch: null,
    },
    "Mobile (360x640)": {
      width: 360,
      height: 640,
      radius: "0.5rem",
      notch: null,
    },
  },
};

// --- Helper Components ---

// FileExplorer Component
const FileExplorer: React.FC<{
  files: FileNode[];
  onSelectFile: (path: string) => void;
  selectedFile: string;
  onAddFile: (parentPath: string) => void;
  onDeleteFile: (path: string) => void;
}> = ({ files, onSelectFile, selectedFile, onAddFile, onDeleteFile }) => {
  const [isOpen, setIsOpen] = useState(true);
  const renderFileNode = (node: FileNode, depth: number = 0) => {
    if (node.type === "folder") {
      return (
        <div key={node.path}>
          <div
            className="flex items-center justify-between p-1 rounded cursor-pointer group hover:bg-muted"
            style={{ paddingLeft: `${depth * 16 + 4}px` }}
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-yellow-500" />
              <span>{node.name}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddFile(node.path);
              }}
              className="opacity-0 group-hover:opacity-100"
            >
              <FilePlus className="w-4 h-4" />
            </button>
          </div>
          {isOpen && node.children && (
            <div>
              {node.children.map((child) => renderFileNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }
    return (
      <div
        key={node.path}
        className={`flex items-center justify-between p-1 rounded cursor-pointer group hover:bg-muted ${
          selectedFile === node.path ? "bg-primary/20" : ""
        }`}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={() => onSelectFile(node.path)}
      >
        <div className="flex items-center gap-2">
          <FileIcon className="w-4 h-4" />
          <span>{node.name}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteFile(node.path);
          }}
          className="opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4 text-red-500/80" />
        </button>
      </div>
    );
  };
  return (
    <div className="h-full bg-muted/40 p-2 overflow-y-auto text-sm">
      {files.map((node) => renderFileNode(node))}
    </div>
  );
};

// PreviewFrame Component
const PreviewFrame = ({ code }: { code: string }) => {
  const generatePreviewHTML = (code: string): string => `
    <!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script><script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script><script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: -apple-system, sans-serif; background-color: #fff; color: #111; } #root { width: 100%; height: 100%; display: flex; flex-direction: column; }</style></head>
    <body><div id="root"></div><script type="text/babel">
      const { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } = {
        View: ({ children, style }) => (<div style={Object.assign({}, ...(Array.isArray(style) ? style : [style]))}>{children}</div>),
        Text: ({ children, style }) => (<span style={Object.assign({}, ...(Array.isArray(style) ? style : [style]))}>{children}</span>),
        StyleSheet: { create: (styles) => styles },
        TouchableOpacity: ({ children, onPress, style }) => (<div onClick={onPress} style={{ cursor: 'pointer', ...Object.assign({}, ...(Array.isArray(style) ? style : [style])) }}>{children}</div>),
        ScrollView: ({ children, style, contentContainerStyle }) => (<div style={{ overflow: 'auto', flex: 1, ...Object.assign({}, ...(Array.isArray(style) ? style : [style])), ...Object.assign({}, ...(Array.isArray(contentContainerStyle) ? contentContainerStyle : [contentContainerStyle])) }}>{children}</div>),
        SafeAreaView: ({ children, style }) => (<div style={{ flex: 1, display: 'flex', flexDirection: 'column', ...Object.assign({}, ...(Array.isArray(style) ? style : [style])) }}>{children}</div>)
      };
      try { ${code}\n\nReactDOM.createRoot(document.getElementById('root')).render(<App />); } catch (error) { document.getElementById('root').innerHTML = '<div style="padding:1rem;color:red;font-family:monospace;">Error: ' + error.message + '</div>'; }
    </script></body></html>`;

  return (
    <iframe
      srcDoc={generatePreviewHTML(code)}
      className="w-full h-full border-0"
      sandbox="allow-scripts allow-same-origin"
      title="preview"
    />
  );
};

// --- Main Playground Editor Component ---
export default function PlaygroundEditor({
  projectId,
}: {
  projectId?: string;
}) {
  const [files, setFiles] = useState<FileNode[]>(DEFAULT_FILES);
  const [selectedFile, setSelectedFile] = useState<string>("App.jsx");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<"connected" | "rebuilding">("connected");
  const [compiledCode, setCompiledCode] = useState("");
  const [paneWidths, setPaneWidths] = useState([20, 40, 40]);
  const [showFooter, setShowFooter] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setAuthToken(storedToken);
      } else {
        console.error("No authentication token found. Redirecting to login.");
        window.location.href = "/login";
      }
    }
  }, []);

  const [previewDevice, setPreviewDevice] = useState({
    type: "iphone" as keyof typeof DEVICE_CONFIG,
    model: "iPhone 16 Pro Max",
  });

  const mainContainerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef<number | null>(null);

  const findFileNode = (nodes: FileNode[], path: string): FileNode | null => {
    for (const node of nodes) {
      if (node.path === path) return node;
      if (node.children) {
        const found = findFileNode(node.children, path);
        if (found) return found;
      }
    }
    return null;
  };

  useEffect(() => {
    if (!isLoading && files.length > 0) {
      runCode();
    }
  }, [isLoading]);

  useEffect(() => {
    // Only run this if we have the necessary IDs and token
    if (!projectId || !authToken) {
      setIsLoading(false); // Not loading if we can't fetch
      return;
    }

    const fetchProjectData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:4000/api/projects/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch project data.");
        }

        const projectData = await response.json();

        // The API returns a flat list of files. We need to convert it into a tree structure.
        // This is a placeholder for a real tree-building function. For now, we'll assume a flat structure is ok.
        // Or better yet, we can build the tree structure from the flat list.
        const fileTree = buildFileTree(projectData.files);

        setFiles(fileTree);

        // Automatically select the first file to display
        if (projectData.files && projectData.files.length > 0) {
          // A smarter version would find 'app/index.js'
          const entryPoint =
            projectData.files.find((f: any) => f.name === "App.js") ||
            projectData.files[0];
          setSelectedFile(entryPoint.name);
        }
      } catch (error) {
        console.error("Fetch Project Error:", error);
        alert("Could not load your project.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, authToken]);
  const buildFileTree = (fileList: any[]): FileNode[] => {
    return [
      {
        id: "folder-app",
        name: "app",
        type: "folder",
        path: "app",
        children: fileList.map((file) => ({
          ...file,
          type: "file",
          path: file.name, // The full path IS the name from the DB
        })),
      },
    ];
  };

  // --- NEW: FUNCTION TO SAVE THE CURRENT FILE ---
  const saveCurrentFile = async () => {
    if (!selectedFile) {
      console.error("Attempted to save with no file selected.");
      return false;
    }
    const fileToSave = findFileNode(files, selectedFile);
    if (!fileToSave || fileToSave.type !== "file") {
      alert("No valid file selected to save.");
      return false; // Indicate failure
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `http://localhost:4000/api/projects/${projectId}/files/${fileToSave.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ content: fileToSave.content }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save the file.");
      }

      console.log("File saved successfully!");
      return true; // Indicate success
    } catch (error) {
      console.error("Save Error:", error);
      alert(
        `Error saving file: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return false; // Indicate failure
    } finally {
      setIsSaving(false);
    }
  };

  // --- MODIFIED "RUN" LOGIC ---
  const runCode = async () => {
    if (isSaving || isRunning) return; // Prevent multiple clicks

    // Step 1: Save the current file before running.
    const saveSuccess = await saveCurrentFile();

    // Step 2: If saving was successful, proceed to run the session.
    if (saveSuccess) {
      setIsRunning(true);
      setSessionId(projectId || "");
    } else {
      // If saving failed, do not start the run session.
      console.log("Run aborted due to save failure.");
    }
  };

  useEffect(() => {
    runCode();
  }, []);

  const handleScroll = () => {
    if (mainContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        mainContainerRef.current;
      if (scrollTop > 50) {
        setShowFooter(true);
      } else {
        setShowFooter(false);
      }
    }
  };

  const findFile = (nodes: FileNode[], path: string): string | null => {
    for (const node of nodes) {
      if (node.path === path && node.type === "file") return node.content || "";
      if (node.type === "folder" && node.children) {
        const result = findFile(node.children, path);
        if (result !== null) return result;
      }
    }
    return null;
  };
  const getCurrentFileContent = (): string =>
    findFile(files, selectedFile) ?? "";

  const updateFileContent = (path: string, content: string) => {
    const updateNode = (nodes: FileNode[]): FileNode[] =>
      nodes.map((node) => {
        if (node.path === path) return { ...node, content };
        if (node.children)
          return { ...node, children: updateNode(node.children) };
        return node;
      });
    setFiles(updateNode(files));
  };

  const handleAddFile = async (parentPath: string) => {
    const fileName = prompt("Enter file name (e.g., NewComponent.js):");
    if (!fileName || !fileName.trim()) return;

    // We assume new files are created in the 'app' directory for this playground
    const fullPath = `app/${fileName}`;

    try {
      // 1. Call the backend to create the file in the database
      const response = await fetch(
        `http://localhost:4000/api/projects/${projectId}/files`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            name: fullPath,
            content: `// New file: ${fileName}\n\nexport default function NewComponent() {\n  return null;\n}`,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create file on the server.");
      }

      const newFileFromServer = await response.json();

      // 2. Update the local state to reflect the change
      // A more robust solution would re-fetch the project, but for now we'll add it manually.
      const newFileNode: FileNode = {
        id: newFileFromServer.id,
        name: fileName,
        type: "file",
        path: newFileFromServer.name,
        content: newFileFromServer.content,
      };

      const addFileToTree = (nodes: FileNode[]): FileNode[] => {
        return nodes.map((node) => {
          if (node.path === parentPath && node.type === "folder") {
            return {
              ...node,
              children: [...(node.children || []), newFileNode],
            };
          }
          if (node.type === "folder" && node.children) {
            return { ...node, children: addFileToTree(node.children) };
          }
          return node;
        });
      };

      setFiles((prevFiles) => addFileToTree(prevFiles));
      setSelectedFile(newFileNode.path);
    } catch (error) {
      console.error("Add File Error:", error);
      alert("Could not create the file.");
    }
  };

  // --- REVISED: handleDeleteFile ---
  const handleDeleteFile = async (path: string) => {
    if (
      !confirm(
        `Are you sure you want to delete ${path}? This cannot be undone.`
      )
    )
      return;

    const fileToDelete = findFileNode(files, path);
    if (!fileToDelete) return;

    try {
      // 1. Call the backend to delete the file from the database
      const response = await fetch(
        `http://localhost:4000/api/projects/${projectId}/files/${fileToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete the file on the server.");
      }

      // 2. Update the local state to remove the file
      const deleteFromTree = (nodes: FileNode[]): FileNode[] => {
        return nodes
          .filter((node) => node.path !== path)
          .map((node) => {
            if (node.type === "folder" && node.children) {
              return { ...node, children: deleteFromTree(node.children) };
            }
            return node;
          });
      };
      setFiles((prevFiles) => deleteFromTree(prevFiles));
      if (selectedFile === path) {
        setSelectedFile("App.js"); // Reset to a safe default
      }
    } catch (error) {
      console.error("Delete File Error:", error);
      alert("Could not delete the file.");
    }
  };

  const handleDeviceTypeChange = (type: keyof typeof DEVICE_CONFIG) => {
    /* ... implementation ... */
  };
  const onMouseDown = (index: number) => (e: React.MouseEvent) => {
    isResizing.current = index;
    e.preventDefault();
  };

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isResizing.current === null || !sidebarRef.current) return;
      const containerWidth = sidebarRef.current.offsetWidth;
      const clientX = e.clientX;
      const containerStart = sidebarRef.current.getBoundingClientRect().left;
      let deltaPercent = 0;

      if (isResizing.current === 0) {
        const dividerPos = (paneWidths[0] / 100) * containerWidth;
        deltaPercent =
          ((clientX - containerStart - dividerPos) / containerWidth) * 100;
      } else {
        // Resizing second divider
        const dividerPos =
          ((paneWidths[0] + paneWidths[1]) / 100) * containerWidth;
        deltaPercent =
          ((clientX - containerStart - dividerPos) / containerWidth) * 100;
      }

      setPaneWidths((prev) => {
        const newWidths = [...prev];
        const minWidth = 10;
        const firstIndex = isResizing.current!;
        const secondIndex = firstIndex + 1;

        if (
          newWidths[firstIndex] + deltaPercent > minWidth &&
          newWidths[secondIndex] - deltaPercent > minWidth
        ) {
          newWidths[firstIndex] += deltaPercent;
          newWidths[secondIndex] -= deltaPercent;
        }
        return newWidths;
      });
    },
    [paneWidths]
  );

  const onMouseUp = useCallback(() => {
    isResizing.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);
  console.log("RENDER", { selectedFile, files });
  const currentFileName = selectedFile.split("/").pop() || "";
  const { type, model } = previewDevice;
  const currentDeviceConfig =
    DEVICE_CONFIG[type][model as keyof (typeof DEVICE_CONFIG)[typeof type]];

  return (
    <div
      className="h-[calc(100vh-4rem)] overflow-y-auto"
      ref={mainContainerRef}
      onScroll={handleScroll}
    >
      <div className="flex flex-col min-h-full">
        <main
          className="flex-1 flex"
          ref={sidebarRef}
          style={{ height: "calc(100vh - 4rem - 50px)" }}
        >
          {" "}
          {/* Adjust height for footer */}
          <div style={{ width: `${paneWidths[0]}%` }} className="flex-shrink-0">
            <FileExplorer
              files={files}
              onSelectFile={setSelectedFile}
              selectedFile={selectedFile}
              onAddFile={handleAddFile}
              onDeleteFile={handleDeleteFile}
            />
          </div>
          <div
            onMouseDown={onMouseDown(0)}
            className="w-2 cursor-col-resize bg-border hover:bg-primary transition-colors flex-shrink-0"
          />
          <div
            style={{ width: `${paneWidths[1]}%` }}
            className="flex-shrink-0 p-4 flex flex-col"
          >
            <Card className="h-full rounded-xl shadow-lg border overflow-hidden flex flex-col">
              <div className="bg-muted/50 border-b px-4 py-2">
                <span className="text-sm font-medium">{currentFileName}</span>
              </div>
              <div className="flex-1 bg-[#1e1e1e]">
                <textarea
                  value={getCurrentFileContent()}
                  onChange={(e) =>
                    updateFileContent(selectedFile, e.target.value)
                  }
                  className="w-full h-full bg-transparent text-white font-mono text-sm p-4 resize-none outline-none"
                  spellCheck="false"
                />
              </div>
            </Card>
          </div>
          <div
            onMouseDown={onMouseDown(1)}
            className="w-2 cursor-col-resize bg-border hover:bg-primary transition-colors flex-shrink-0"
          />
          <div
            style={{ width: `${paneWidths[2]}%` }}
            className="flex-shrink-0 p-4 flex flex-col gap-4"
          >
            <Card className="p-2 border">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => alert("Download clicked")}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => alert("Git Push clicked")}
                  >
                    <GitMerge className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveCurrentFile}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>

                <Button
                  onClick={runCode}
                  className="gap-2"
                  disabled={isRunning || isSaving}
                >
                  <Play className="w-4 h-4" />{" "}
                  {isRunning ? "Running..." : "Run"}
                </Button>
                <div className="flex items-center gap-2 flex-grow">
                  <Select
                    value={type}
                    onValueChange={(v: keyof typeof DEVICE_CONFIG) =>
                      handleDeviceTypeChange(v)
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iphone">
                        <div className="flex items-center">
                          <Tablet className="w-4 h-4 mr-2" />
                          iPhone
                        </div>
                      </SelectItem>
                      <SelectItem value="android">
                        <div className="flex items-center">
                          <Smartphone className="w-4 h-4 mr-2" />
                          Android
                        </div>
                      </SelectItem>
                      <SelectItem value="web">
                        <div className="flex items-center">
                          <Monitor className="w-4 h-4 mr-2" />
                          Web
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={model}
                    onValueChange={(m: string) =>
                      setPreviewDevice((p) => ({ ...p, model: m }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(DEVICE_CONFIG[type]).map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <div className="flex-1 flex items-center justify-center bg-muted/20 rounded-lg p-2 overflow-y-auto">
              {/* THIS IS THE KEY CHANGE */}
              {isRunning && sessionId ? (
                // If the session is active, show the live stream
                <div
                  className="bg-gray-950 shadow-2xl p-2.5 relative transition-all flex items-center justify-center my-4"
                  // We ignore the dynamic sizing for now and just make it fill the space
                  style={{
                    width: "330px",
                    height: "680px",
                    borderRadius: "1.75rem",
                  }}
                >
                  <div
                    className="w-full h-full overflow-hidden bg-white"
                    style={{ borderRadius: `calc(1.75rem - 8px)` }}
                  >
                    <EmulatorStream
                      projectId={sessionId}
                      authToken={authToken || ""}
                    />
                  </div>
                </div>
              ) : (
                // If not running, show a placeholder
                <div className="text-center text-muted-foreground">
                  <Smartphone size={48} className="mx-auto mb-2" />
                  <p>Click "Run" to start the live preview.</p>
                </div>
              )}
            </div>
          </div>
        </main>

        <footer
          className={`transition-opacity duration-300 ${
            showFooter ? "opacity-100" : "opacity-0"
          } mt-auto h-[50px] border-t bg-card px-6 flex items-center justify-between`}
        >
          <p className="text-xs text-muted-foreground">
            &copy; 2025 RNLive Hackathon
          </p>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Theme:</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Light</span>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
              />
              <span className="text-xs text-muted-foreground">Dark</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
