"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Circle } from "lucide-react";
import FileExplorer, { FileNode } from "@/components/FileExplorer";

const DEFAULT_FILES: FileNode[] = [
  {
    name: "src",
    type: "folder",
    path: "src",
    children: [
      {
        name: "App.js",
        type: "file",
        path: "src/App.js",
        content: `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello RNLive</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});`,
      },
      {
        name: "components",
        type: "folder",
        path: "src/components",
        children: [
          {
            name: "Button.js",
            type: "file",
            path: "src/components/Button.js",
            content: `import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function Button({ title, onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});`,
          },
        ],
      },
      {
        name: "screens",
        type: "folder",
        path: "src/screens",
        children: [
          {
            name: "HomeScreen.js",
            type: "file",
            path: "src/screens/HomeScreen.js",
            content: `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <Text style={styles.subtitle}>Welcome to RNLive</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});`,
          },
        ],
      },
    ],
  },
];

export default function PlaygroundEditor() {
  const [files, setFiles] = useState<FileNode[]>(DEFAULT_FILES);
  const [selectedFile, setSelectedFile] = useState<string>("src/App.js");
  const [previewMode, setPreviewMode] = useState<"light" | "dark">("light");
  const [status, setStatus] = useState<"connected" | "rebuilding">("connected");
  const [compiledCode, setCompiledCode] = useState("");

  // Load files from localStorage on mount
  useEffect(() => {
    const savedFiles = localStorage.getItem("rnlive-files");
    const savedSelectedFile = localStorage.getItem("rnlive-selected-file");
    if (savedFiles) {
      setFiles(JSON.parse(savedFiles));
    }
    if (savedSelectedFile) {
      setSelectedFile(savedSelectedFile);
    }
  }, []);

  // Save files to localStorage when they change
  useEffect(() => {
    localStorage.setItem("rnlive-files", JSON.stringify(files));
  }, [files]);

  // Save selected file to localStorage
  useEffect(() => {
    localStorage.setItem("rnlive-selected-file", selectedFile);
  }, [selectedFile]);

  // Get current file content
  const getCurrentFileContent = (): string => {
    const findFile = (nodes: FileNode[], path: string): string => {
      for (const node of nodes) {
        if (node.path === path && node.type === "file") {
          return node.content || "";
        }
        if (node.type === "folder" && node.children) {
          const result = findFile(node.children, path);
          if (result) return result;
        }
      }
      return "";
    };
    return findFile(files, selectedFile);
  };

  // Update file content
  const updateFileContent = (path: string, content: string) => {
    const updateNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.path === path && node.type === "file") {
          return { ...node, content };
        }
        if (node.type === "folder" && node.children) {
          return { ...node, children: updateNode(node.children) };
        }
        return node;
      });
    };
    setFiles(updateNode(files));
  };

  // Auto-compile code when it changes
  useEffect(() => {
    const appContent = files.find(f => f.path === "src")
      ?.children?.find(f => f.path === "src/App.js")?.content || "";
    
    const timeout = setTimeout(() => {
      setStatus("rebuilding");
      try {
        setCompiledCode(appContent);
        setTimeout(() => setStatus("connected"), 500);
      } catch (error) {
        console.error("Compilation error:", error);
        setTimeout(() => setStatus("connected"), 500);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [files]);

  const handleRun = () => {
    setStatus("rebuilding");
    const appContent = files.find(f => f.path === "src")
      ?.children?.find(f => f.path === "src/App.js")?.content || "";
    setCompiledCode(appContent);
    setTimeout(() => setStatus("connected"), 800);
  };

  // Expose handleRun to parent via window for Navbar button
  useEffect(() => {
    (window as any).runPlaygroundCode = handleRun;
    return () => {
      delete (window as any).runPlaygroundCode;
    };
  }, [files]);

  const handleAddFile = (parentPath: string) => {
    const fileName = prompt("Enter file name (e.g., NewComponent.js):");
    if (!fileName) return;

    const newFile: FileNode = {
      name: fileName,
      type: "file",
      path: `${parentPath}/${fileName}`,
      content: `// ${fileName}\n`,
    };

    const addFileToTree = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.path === parentPath && node.type === "folder") {
          return {
            ...node,
            children: [...(node.children || []), newFile],
          };
        }
        if (node.type === "folder" && node.children) {
          return { ...node, children: addFileToTree(node.children) };
        }
        return node;
      });
    };

    setFiles(addFileToTree(files));
    setSelectedFile(newFile.path);
  };

  const handleDeleteFile = (path: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

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

    setFiles(deleteFromTree(files));
    if (selectedFile === path) {
      setSelectedFile("src/App.js");
    }
  };

  const currentContent = getCurrentFileContent();
  const currentFileName = selectedFile.split("/").pop() || "";
  const fileExtension = currentFileName.split(".").pop() || "javascript";
  const languageMap: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    json: "json",
    css: "css",
    md: "markdown",
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)]">
      {/* Main Split Screen */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: File Explorer (20%) */}
        <div className="w-[20%] overflow-hidden">
          <FileExplorer
            files={files}
            onSelectFile={setSelectedFile}
            selectedFile={selectedFile}
            onAddFile={handleAddFile}
            onDeleteFile={handleDeleteFile}
          />
        </div>

        {/* Middle: Code Editor (40%) */}
        <div className="w-[40%] p-4 overflow-hidden flex flex-col">
          <Card className="h-full rounded-xl shadow-lg border border-border overflow-hidden flex flex-col">
            {/* File Tab */}
            <div className="bg-muted/50 border-b border-border px-4 py-2">
              <span className="text-sm font-medium text-foreground">{currentFileName}</span>
            </div>
            {/* Editor */}
            <div className="flex-1">
              <Editor
                height="100%"
                language={languageMap[fileExtension] || "javascript"}
                theme="vs-dark"
                value={currentContent}
                onChange={(value) => updateFileContent(selectedFile, value || "")}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  automaticLayout: true,
                }}
              />
            </div>
          </Card>
        </div>

        {/* Right: Phone Emulator Preview (40%) */}
        <div className="w-[40%] p-4 flex items-center justify-center">
          <div className="relative">
            {/* Phone Frame */}
            <div className="w-[320px] h-[640px] bg-gray-900 rounded-[3rem] shadow-2xl p-3 relative">
              {/* Phone Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10"></div>
              
              {/* Phone Screen */}
              <div
                className={`w-full h-full rounded-[2.5rem] overflow-auto ${
                  previewMode === "light" ? "bg-[#f8fafc]" : "bg-gray-800"
                }`}
              >
                <PreviewFrame code={compiledCode} theme={previewMode} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Status Bar */}
      <div className="h-12 border-t border-border bg-card px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Circle
            className={`w-2 h-2 ${
              status === "connected" ? "text-green-500" : "text-yellow-500"
            }`}
            fill="currentColor"
          />
          <span className="text-sm font-medium text-foreground">
            {status === "connected" ? "Connected" : "Rebuilding..."}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Preview Mode:</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Light</span>
            <Switch
              checked={previewMode === "dark"}
              onCheckedChange={(checked) =>
                setPreviewMode(checked ? "dark" : "light")
              }
            />
            <span className="text-xs text-muted-foreground">Dark</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Preview Frame Component
function PreviewFrame({ code, theme }: { code: string; theme: "light" | "dark" }) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [code]);

  if (!code) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
          Write code to see preview
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <p className="text-red-500 text-sm font-medium mb-2">Error</p>
          <p className="text-xs text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <iframe
        srcDoc={generatePreviewHTML(code, theme)}
        className="w-full h-full border-0"
        sandbox="allow-scripts"
        title="preview"
      />
    </div>
  );
}

// Generate HTML for preview iframe
function generatePreviewHTML(code: string, theme: "light" | "dark"): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: ${theme === "light" ? "#f8fafc" : "#1f2937"};
            color: ${theme === "light" ? "#333" : "#f3f4f6"};
            overflow: hidden;
          }
          #root { 
            width: 100vw; 
            height: 100vh; 
            display: flex;
            flex-direction: column;
          }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script type="text/babel">
          const { View, Text, StyleSheet, TouchableOpacity, ScrollView } = {
            View: ({ children, style }) => (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                ...Object.assign({}, ...(Array.isArray(style) ? style : [style]))
              }}>
                {children}
              </div>
            ),
            Text: ({ children, style }) => (
              <span style={Object.assign({}, ...(Array.isArray(style) ? style : [style]))}>
                {children}
              </span>
            ),
            StyleSheet: {
              create: (styles) => styles
            },
            TouchableOpacity: ({ children, onPress, style }) => (
              <div 
                onClick={onPress}
                style={{ 
                  cursor: 'pointer',
                  ...Object.assign({}, ...(Array.isArray(style) ? style : [style]))
                }}
              >
                {children}
              </div>
            ),
            ScrollView: ({ children, style }) => (
              <div style={{ 
                overflow: 'auto',
                ...Object.assign({}, ...(Array.isArray(style) ? style : [style]))
              }}>
                {children}
              </div>
            )
          };

          try {
            ${code}
            
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(<App />);
          } catch (error) {
            document.getElementById('root').innerHTML = 
              '<div style="padding: 20px; color: red; font-size: 14px;">Error: ' + 
              error.message + '</div>';
          }
        </script>
      </body>
    </html>
  `;
}