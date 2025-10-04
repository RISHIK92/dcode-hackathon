"use client";

import { useState } from "react";
import { 
  ChevronRight, 
  ChevronDown, 
  File, 
  Folder, 
  FolderOpen,
  Plus,
  Download,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export type FileNode = {
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileNode[];
  path: string;
};

type FileExplorerProps = {
  files: FileNode[];
  onSelectFile: (path: string) => void;
  selectedFile: string | null;
  onAddFile: (parentPath: string) => void;
  onDeleteFile: (path: string) => void;
};

export default function FileExplorer({
  files,
  onSelectFile,
  selectedFile,
  onAddFile,
  onDeleteFile,
}: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["src", "src/components", "src/screens"])
  );

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleDownload = async () => {
    const zip = new JSZip();
    
    const addFilesToZip = (nodes: FileNode[], folder: JSZip) => {
      nodes.forEach(node => {
        if (node.type === "file" && node.content) {
          folder.file(node.name, node.content);
        } else if (node.type === "folder" && node.children) {
          const subFolder = folder.folder(node.name);
          if (subFolder) {
            addFilesToZip(node.children, subFolder);
          }
        }
      });
    };

    addFilesToZip(files, zip);

    // Add package.json
    const packageJson = {
      name: "rnlive-project",
      version: "1.0.0",
      main: "src/App.js",
      dependencies: {
        react: "^18.2.0",
        "react-native": "^0.72.0"
      }
    };
    zip.file("package.json", JSON.stringify(packageJson, null, 2));

    // Add README
    zip.file("README.md", "# RNLive Project\n\nExported from RNLive Playground");

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "rnlive-project.zip");
  };

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">EXPLORER</h3>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => onAddFile("src")}
            title="New File"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={handleDownload}
            title="Download Project"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-auto p-2">
        <div className="text-xs">
          <div className="mb-2 text-muted-foreground font-medium px-2">
            RNLive Project
          </div>
          {files.map((node) => (
            <FileTreeNode
              key={node.path}
              node={node}
              level={0}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              onSelectFile={onSelectFile}
              selectedFile={selectedFile}
              onDeleteFile={onDeleteFile}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

type FileTreeNodeProps = {
  node: FileNode;
  level: number;
  expandedFolders: Set<string>;
  toggleFolder: (path: string) => void;
  onSelectFile: (path: string) => void;
  selectedFile: string | null;
  onDeleteFile: (path: string) => void;
};

function FileTreeNode({
  node,
  level,
  expandedFolders,
  toggleFolder,
  onSelectFile,
  selectedFile,
  onDeleteFile,
}: FileTreeNodeProps) {
  const isExpanded = expandedFolders.has(node.path);
  const isSelected = selectedFile === node.path;

  if (node.type === "folder") {
    return (
      <div>
        <div
          className={`flex items-center gap-1 px-2 py-1 hover:bg-accent rounded cursor-pointer group ${
            isSelected ? "bg-accent" : ""
          }`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => toggleFolder(node.path)}
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          )}
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-blue-500" />
          ) : (
            <Folder className="h-4 w-4 text-blue-500" />
          )}
          <span className="text-foreground flex-1">{node.name}</span>
        </div>
        {isExpanded && node.children && (
          <div>
            {node.children.map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                level={level + 1}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
                onSelectFile={onSelectFile}
                selectedFile={selectedFile}
                onDeleteFile={onDeleteFile}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 hover:bg-accent rounded cursor-pointer group ${
        isSelected ? "bg-accent" : ""
      }`}
      style={{ paddingLeft: `${level * 12 + 20}px` }}
      onClick={() => onSelectFile(node.path)}
    >
      <File className="h-4 w-4 text-muted-foreground" />
      <span className="text-foreground flex-1">{node.name}</span>
      <Button
        size="sm"
        variant="ghost"
        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteFile(node.path);
        }}
      >
        <Trash2 className="h-3 w-3 text-destructive" />
      </Button>
    </div>
  );
}