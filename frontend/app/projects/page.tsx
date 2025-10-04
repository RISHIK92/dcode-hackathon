"use client";

import React, { useState, useEffect } from 'react';
// useRouter is removed as it's Next.js specific. Navigation will be handled by window.location.
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, FolderOpen, Code2, Archive, ArchiveRestore, Rocket, Edit } from 'lucide-react';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Self-Contained Project Storage Logic ---
export interface FileNode {
  name: string;
  type: "file" | "folder";
  path: string;
  content?: string;
  children?: FileNode[];
}

export interface Project {
  id: string;
  name: string;
  template: 'react-native-blank' | 'react-native-template';
  files: FileNode[];
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  description?: string;
}

const PROJECTS_STORAGE_KEY = 'RNLIVE_PROJECTS';

const getProjects = (): Project[] => {
  if (typeof window === 'undefined') return [];
  const projectsJson = localStorage.getItem(PROJECTS_STORAGE_KEY);
  return projectsJson ? JSON.parse(projectsJson) : [];
};

const saveProjects = (projects: Project[]) => {
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
};

export const getCurrentProjects = (): Project[] => getProjects().filter(p => !p.isArchived).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
export const getArchivedProjects = (): Project[] => getProjects().filter(p => p.isArchived).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

export const createProject = (name: string, template: Project['template']): Project => {
  const now = new Date().toISOString();
  const newProject: Project = {
    id: `proj_${Date.now()}`,
    name,
    template,
    files: [/* Basic file structure based on template can be added here */],
    createdAt: now,
    updatedAt: now,
    isArchived: false,
    description: `A new ${template} project.`
  };
  const projects = getProjects();
  saveProjects([...projects, newProject]);
  return newProject;
};

export const deleteProject = (id: string) => {
  const projects = getProjects().filter(p => p.id !== id);
  saveProjects(projects);
};

const updateProjectStatus = (id: string, isArchived: boolean) => {
  const projects = getProjects().map(p => p.id === id ? { ...p, isArchived, updatedAt: new Date().toISOString() } : p);
  saveProjects(projects);
};

export const archiveProject = (id: string) => updateProjectStatus(id, true);
export const unarchiveProject = (id: string) => updateProjectStatus(id, false);

// --- New Project Modal (Self-Contained) ---
const NewProjectModal = ({ open, onClose, onCreateProject }: { open: boolean, onClose: () => void, onCreateProject: (name: string, template: string) => void }) => {
  const [name, setName] = useState('');
  const [template, setTemplate] = useState('react-native-blank');

  const handleCreate = () => {
    if (name.trim()) {
      onCreateProject(name, template);
      setName('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Give your new project a name and choose a template to start from.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="My Awesome App" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="template" className="text-right">Template</Label>
            <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Select a template" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="react-native-blank">Blank Project</SelectItem>
                    <SelectItem value="react-native-template">Navigation Template</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" onClick={handleCreate} disabled={!name.trim()}>Create Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- Edit Project Dialog (New Component) ---
const EditProjectDialog = ({ project, onClose, onNavigate }: { project: Project | null, onClose: () => void, onNavigate: (id: string) => void }) => {
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
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onNavigate(project.id)}>Go to Playground</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- Main Projects Page Component ---
export default function ProjectsPage() {
  const [currentProjects, setCurrentProjects] = useState<Project[]>([]);
  const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const loadProjects = () => {
    setCurrentProjects(getCurrentProjects());
    setArchivedProjects(getArchivedProjects());
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  const handleCreateProject = (name: string, template: string) => {
    const project = createProject(name, template as any);
    handleNavigate(`/playground/${project.id}`);
  };

  const handleDeleteProject = (id: string) => {
    deleteProject(id);
    loadProjects();
    setDeleteConfirm(null);
  };

  const handleArchiveProject = (id: string) => { archiveProject(id); loadProjects(); };
  const handleUnarchiveProject = (id: string) => { unarchiveProject(id); loadProjects(); };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-black/30 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold">My Projects</h1>
            <p className="text-muted-foreground">Welcome back! Manage your projects or start a new one.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} size="lg"><Plus className="w-5 h-5 mr-2" /> New Project</Button>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Active Projects</h2>
        {currentProjects.length === 0 ? (
          <Card className="text-center p-12 border-2 border-dashed">
             <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ready for Liftoff?</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Your next great idea starts here. Create a project to begin your journey.</p>
              {/* "Create First Project" Button is removed as requested */}
          </Card>
        ) : (
          <div className="space-y-2">
            {currentProjects.map((project) => (
              <Card key={project.id} className="bg-card text-card-foreground flex flex-row items-start justify-between rounded-xl border shadow-sm p-4 gap-4">
                <div 
                  className="cursor-pointer group flex-grow min-w-0"
                  onClick={() => setEditingProject(project)}
                >
                  <p className="font-semibold text-lg text-foreground group-hover:text-blue-600 transition-colors truncate">{project.name}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <p className="text-sm text-muted-foreground hidden sm:block whitespace-nowrap">
                    Created on {formatDate(project.createdAt).format(new Date(project.createdAt))}
                  </p>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(project.id)} className="text-red-500/80 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {archivedProjects.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
              <Archive className="w-5 h-5" /> Archived
            </h2>
            <div className="space-y-2">
              {archivedProjects.map((project) => (
                <Card key={project.id} className="bg-card text-card-foreground flex flex-row items-start justify-between rounded-xl border shadow-sm p-4 gap-4">
                  <div className="flex-grow min-w-0">
                    <p className="font-semibold text-lg text-muted-foreground truncate">{project.name}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <p className="text-sm text-muted-foreground hidden sm:block whitespace-nowrap">
                      Archived on {formatDate(project.updatedAt).format(new Date(project.updatedAt))}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleUnarchiveProject(project.id)}>
                        <ArchiveRestore className="w-4 h-4 mr-2" />
                        Restore
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(project.id)} className="text-red-500/80 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
      <NewProjectModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onCreateProject={handleCreateProject} />
      <EditProjectDialog
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onNavigate={(id) => handleNavigate(`/playground/${id}`)}
      />
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the project and all its associated files. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDeleteProject(deleteConfirm)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

