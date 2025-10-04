"use client";

import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
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
import { Circle, Smartphone, Tablet, Monitor, FilePlus, Trash2, Folder, File as FileIcon } from "lucide-react";

// Define the FileNode type directly in the file
export interface FileNode {
  name: string;
  type: "file" | "folder";
  path: string;
  content?: string;
  children?: FileNode[];
}

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
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Welcome to RNLive!</Text>
        <Text style={styles.subtitle}>Edit the code to see it update in real-time.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});`,
      },
    ],
  },
];

const DEVICE_CONFIG = {
  iphone: {
    "iPhone 16 Pro Max": { width: 345, height: 715, radius: "3.25rem", notch: "dynamic-island" },
    "iPhone 16": { width: 320, height: 665, radius: "3rem", notch: "dynamic-island" },
    "iPhone 15": { width: 320, height: 655, radius: "3rem", notch: "dynamic-island" },
    "iPhone SE": { width: 300, height: 535, radius: "1.5rem", notch: "classic" },
  },
  android: {
    "Pixel 9 Pro": { width: 330, height: 680, radius: "1.75rem", notch: "punch-hole" },
    "Galaxy S25 Ultra": { width: 345, height: 710, radius: "1.25rem", notch: "punch-hole" },
    "Nothing Phone (3)": { width: 325, height: 675, radius: "1.5rem", notch: "punch-hole" },
  },
  web: {
    "Laptop (1366x768)": { width: 683, height: 384, radius: "0.5rem", notch: null },
    "Tablet (768x1024)": { width: 384, height: 512, radius: "0.5rem", notch: null },
    "Mobile (360x640)": { width: 360, height: 640, radius: "0.5rem", notch: null },
  },
};

// --- FileExplorer Component ---
// Moved directly into this file to resolve the import error.
interface FileExplorerProps {
  files: FileNode[];
  onSelectFile: (path: string) => void;
  selectedFile: string;
  onAddFile: (parentPath: string) => void;
  onDeleteFile: (path: string) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ files, onSelectFile, selectedFile, onAddFile, onDeleteFile }) => {
  const renderFileNode = (node: FileNode, depth: number = 0) => {
    const [isOpen, setIsOpen] = useState(true);
    const isSelected = selectedFile === node.path;

    if (node.type === "folder") {
      return (
        <div key={node.path} className="text-sm">
          <div
            className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer group ${isSelected ? "bg-blue-500/20" : "hover:bg-muted/50"}`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-yellow-500" />
              <span>{node.name}</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onAddFile(node.path); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FilePlus className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          {isOpen && node.children && (
            <div>
              {node.children.map(child => renderFileNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={node.path}
        className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer group ${isSelected ? "bg-blue-500/30" : "hover:bg-muted/50"}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelectFile(node.path)}
      >
        <div className="flex items-center gap-2">
          <FileIcon className="w-4 h-4 text-gray-400" />
          <span>{node.name}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteFile(node.path); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-4 h-4 text-red-500/80" />
        </button>
      </div>
    );
  };

  return (
    <div className="h-full bg-muted/30 p-2 overflow-y-auto">
      {files.map(node => renderFileNode(node))}
    </div>
  );
};


// --- Main Playground Editor Component ---
export default function PlaygroundEditor() {
  const [files, setFiles] = useState<FileNode[]>(DEFAULT_FILES);
  const [selectedFile, setSelectedFile] = useState<string>("src/App.js");
  const [previewMode, setPreviewMode] = useState<"light" | "dark">("light");
  const [status, setStatus] = useState<"connected" | "rebuilding">("connected");
  const [compiledCode, setCompiledCode] = useState("");
  
  const [previewDevice, setPreviewDevice] = useState({
    type: 'iphone' as keyof typeof DEVICE_CONFIG,
    model: 'iPhone 16 Pro Max',
  });

  useEffect(() => {
    const appContent = getCurrentFileContent();
    const timeout = setTimeout(() => {
      setStatus("rebuilding");
      setCompiledCode(appContent);
      setTimeout(() => setStatus("connected"), 500);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [files, selectedFile]);

  const getCurrentFileContent = (): string => {
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
    return findFile(files, selectedFile) ?? findFile(files, "src/App.js") ?? "";
  };

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
  
  const handleAddFile = (parentPath: string) => {
    const fileName = prompt("Enter file name (e.g., Component.js):");
    if (!fileName || !fileName.trim()) return;

    const newFile: FileNode = {
      name: fileName,
      type: "file",
      path: `${parentPath}/${fileName}`,
      content: `// ${fileName}\n\nimport React from 'react';\nimport { View, Text } from 'react-native';\n\nexport default function ${fileName.split('.')[0]}() {\n  return (\n    <View>\n      <Text>${fileName.split('.')[0]}</Text>\n    </View>\n  );\n}\n`,
    };

    const addFileToTree = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.path === parentPath && node.type === "folder") {
          return { ...node, children: [...(node.children || []), newFile].sort((a,b) => a.name.localeCompare(b.name)) };
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
    if (path === "src/App.js") {
        alert("Cannot delete the main App.js file.");
        return;
    }
    if (confirm(`Are you sure you want to delete ${path.split('/').pop()}?`)) {
        const deleteFromTree = (nodes: FileNode[]): FileNode[] => {
            return nodes.filter(node => node.path !== path).map(node => {
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
    }
  };

  const handleDeviceTypeChange = (type: keyof typeof DEVICE_CONFIG) => {
    const firstModel = Object.keys(DEVICE_CONFIG[type])[0];
    setPreviewDevice({ type, model: firstModel });
  };

  const currentFileName = selectedFile.split("/").pop() || "";
  const { type, model } = previewDevice;
  const modelsForType = DEVICE_CONFIG[type];
  const currentDeviceConfig = modelsForType[model as keyof typeof modelsForType];

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)]">
      <main className="flex-1 flex overflow-hidden">
        <div className="w-[20%] overflow-hidden">
          <FileExplorer
            files={files}
            onSelectFile={setSelectedFile}
            selectedFile={selectedFile}
            onAddFile={handleAddFile}
            onDeleteFile={handleDeleteFile}
          />
        </div>

        <div className="w-[40%] p-4 overflow-hidden flex flex-col">
           <Card className="h-full rounded-xl shadow-lg border border-border overflow-hidden flex flex-col">
            <div className="bg-muted/50 border-b border-border px-4 py-2">
              <span className="text-sm font-medium text-foreground">{currentFileName}</span>
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                language={"javascript"}
                theme="vs-dark"
                value={getCurrentFileContent()}
                onChange={(value) => updateFileContent(selectedFile, value || "")}
                options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true }}
                path={selectedFile}
              />
            </div>
          </Card>
        </div>

        <div className="w-[40%] p-4 flex flex-col gap-4 overflow-hidden">
          <Card className="p-2 border border-border">
            <div className="flex items-center justify-between gap-4">
              <Select value={previewDevice.type} onValueChange={(value: keyof typeof DEVICE_CONFIG) => handleDeviceTypeChange(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iphone"><div className="flex items-center"><Tablet className="w-4 h-4 mr-2" />iPhone</div></SelectItem>
                  <SelectItem value="android"><div className="flex items-center"><Smartphone className="w-4 h-4 mr-2" />Android</div></SelectItem>
                  <SelectItem value="web"><div className="flex items-center"><Monitor className="w-4 h-4 mr-2" />Web</div></SelectItem>
                </SelectContent>
              </Select>

              <Select value={previewDevice.model} onValueChange={(model: string) => setPreviewDevice(prev => ({ ...prev, model }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select model/size" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(modelsForType).map(modelName => (
                    <SelectItem key={modelName} value={modelName}>{modelName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>
          
          <div className="flex-1 flex items-center justify-center bg-muted/20 rounded-lg p-2">
            {type === 'web' ? (
              <Card
                className="shadow-lg rounded-lg overflow-hidden flex flex-col border border-border transition-all duration-300 ease-in-out"
                style={{ width: currentDeviceConfig.width, height: currentDeviceConfig.height }}
              >
                <div className="bg-muted/50 p-2 flex items-center gap-2 border-b border-border">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className={`flex-1 ${previewMode === "light" ? "bg-white" : "bg-gray-800"}`}>
                  <PreviewFrame code={compiledCode} theme={previewMode} />
                </div>
              </Card>
            ) : (
              <div
                className="bg-gray-950 shadow-2xl p-2.5 relative transition-all duration-300 ease-in-out flex items-center justify-center"
                style={{
                  width: currentDeviceConfig.width,
                  height: currentDeviceConfig.height,
                  borderRadius: currentDeviceConfig.radius
                }}
              >
                {currentDeviceConfig.notch === 'dynamic-island' && <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20"></div>}
                {currentDeviceConfig.notch === 'punch-hole' && <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-20 border-2 border-gray-900"></div>}
                {currentDeviceConfig.notch === 'classic' && <div className="absolute top-0 left-0 w-full h-16 bg-gray-950 z-20" style={{ borderRadius: `${currentDeviceConfig.radius} ${currentDeviceConfig.radius} 0 0` }}><div className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-2 bg-gray-700 rounded-full"></div></div>}
                <div
                  className="w-full h-full overflow-hidden"
                  style={{ 
                    borderRadius: `calc(${currentDeviceConfig.radius} - 8px)`,
                    backgroundColor: previewMode === "light" ? "#f8fafc" : "#1f2937",
                  }}
                >
                  <PreviewFrame code={compiledCode} theme={previewMode} />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="h-12 border-t border-border bg-card px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Circle className={`w-2 h-2 ${status === "connected" ? "text-green-500" : "text-yellow-500"}`} fill="currentColor" />
          <span className="text-sm font-medium text-foreground">{status === "connected" ? "Connected" : "Rebuilding..."}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Theme:</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Light</span>
            <Switch checked={previewMode === "dark"} onCheckedChange={(checked) => setPreviewMode(checked ? "dark" : "light")} />
            <span className="text-xs text-muted-foreground">Dark</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Preview Frame Component (No changes needed)
function PreviewFrame({ code, theme }: { code: string; theme: "light" | "dark" }) {
  return (
    <div className="h-full w-full">
      <iframe
        srcDoc={generatePreviewHTML(code, theme)}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin"
        title="preview"
      />
    </div>
  );
}

// Generate HTML for preview iframe (No changes needed)
function generatePreviewHTML(code: string, theme: "light" | "dark"): string {
  // This function remains the same as before.
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
            width: 100%; 
            height: 100%; 
            display: flex;
            flex-direction: column;
          }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script type="text/babel">
          // Mock React Native Web components
          const { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } = {
            View: ({ children, style }) => (<div style={Object.assign({}, ...(Array.isArray(style) ? style : [style]))}>{children}</div>),
            Text: ({ children, style }) => (<span style={Object.assign({}, ...(Array.isArray(style) ? style : [style]))}>{children}</span>),
            StyleSheet: { create: (styles) => styles },
            TouchableOpacity: ({ children, onPress, style }) => (<div onClick={onPress} style={{ cursor: 'pointer', ...Object.assign({}, ...(Array.isArray(style) ? style : [style])) }}>{children}</div>),
            ScrollView: ({ children, style, contentContainerStyle }) => (<div style={{ overflow: 'auto', ...Object.assign({}, ...(Array.isArray(style) ? style : [style])), ...Object.assign({}, ...(Array.isArray(contentContainerStyle) ? contentContainerStyle : [contentContainerStyle])) }}>{children}</div>),
            SafeAreaView: ({ children, style }) => (<div style={{ flex: 1, ...Object.assign({}, ...(Array.isArray(style) ? style : [style])) }}>{children}</div>)
          };

          try {
            ${code}
            
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(<App />);
          } catch (error) {
            document.getElementById('root').innerHTML = '<div style="padding: 20px; color: red; font-size: 14px; font-family: monospace;">Error: ' + error.message + '</div>';
          }
        </script>
      </body>
    </html>
  `;
}

