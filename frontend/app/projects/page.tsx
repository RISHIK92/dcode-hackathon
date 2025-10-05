"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Rocket } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// --- Types and Interfaces ---
// This interface should match the structure returned by your Prisma backend
export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// --- API Helper Functions ---
const API_URL = "http://localhost:4000/api";

const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

// --- New Project Modal ---
const NewProjectModal = ({
  open,
  onClose,
  onCreateProject,
}: {
  open: boolean;
  onClose: () => void;
  onCreateProject: (name: string) => void;
}) => {
  const [name, setName] = useState("");

  const handleCreate = () => {
    if (name.trim()) {
      onCreateProject(name);
      setName("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Give your new project a name to get started.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="My Awesome App"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleCreate} disabled={!name.trim()}>
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- Open Project Dialog ---
const OpenProjectDialog = ({
  project,
  onClose,
  onNavigate,
}: {
  project: Project | null;
  onClose: () => void;
  onNavigate: (id: string) => void;
}) => {
  if (!project) return null;

  return (
    <Dialog open={!!project} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Open Project</DialogTitle>
          <DialogDescription>
            You are about to open the playground for "{project.name}".
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onNavigate(project.id)}>
            Go to Playground
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- Main Projects Page Component ---
export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [projectToOpen, setProjectToOpen] = useState<Project | null>(null);

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchProjects = async () => {
      const token = getAuthToken();
      if (!token) {
        // Redirect to login if not authenticated
        window.location.href = "/login";
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch projects. Please log in again.");
        }

        const data: Project[] = await response.json();
        setProjects(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // --- Event Handlers ---
  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  const handleCreateProject = async (name: string) => {
    const token = getAuthToken();
    try {
      const response = await fetch(`${API_URL}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to create project.");
      }

      const { project } = await response.json();
      // Directly navigate to the new project's playground
      handleNavigate(`/playground/${project.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleDeleteProject = async (id: string) => {
    const token = getAuthToken();
    try {
      const response = await fetch(`${API_URL}/projects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to delete project.");
      }

      // Refresh project list by filtering out the deleted one
      setProjects((prevProjects) => prevProjects.filter((p) => p.id !== id));
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading projects...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold">My Projects</h1>
            <p className="text-muted-foreground">
              Welcome back! Manage your projects or start a new one.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Button onClick={() => setIsModalOpen(true)} size="lg">
              <Plus className="w-5 h-5 mr-2" /> New Project
            </Button>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Active Projects</h2>
        {projects.length === 0 ? (
          <Card className="text-center p-12 border-2 border-dashed">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ready for Liftoff?</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Your next great idea starts here. Create a project to begin your
              journey.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="bg-card text-card-foreground flex flex-row items-center justify-between rounded-xl border shadow-sm p-4 gap-4"
              >
                <div
                  className="cursor-pointer group flex-grow min-w-0"
                  onClick={() => setProjectToOpen(project)}
                >
                  <p className="font-semibold text-lg text-foreground group-hover:text-blue-600 transition-colors truncate">
                    {project.name}
                  </p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <p className="text-sm text-muted-foreground hidden sm:block whitespace-nowrap">
                    Created on {formatDate(project.createdAt)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteConfirm(project.id)}
                    className="text-red-500/80 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modals and Dialogs */}
      <NewProjectModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
      <OpenProjectDialog
        project={projectToOpen}
        onClose={() => setProjectToOpen(null)}
        onNavigate={(id) => handleNavigate(`/playground/${id}`)}
      />
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project and all its associated
              files. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteConfirm && handleDeleteProject(deleteConfirm)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
