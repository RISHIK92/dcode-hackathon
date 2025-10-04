export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  template: string;
  createdAt: string;
  updatedAt: string;
  files: FileNode[];
  isArchived?: boolean;
}

const STORAGE_KEY = 'rn-playground-projects';

// Template files
const TEMPLATES = {
  blank: {
    name: 'Blank Project',
    files: [
      {
        id: 'app-1',
        name: 'App.tsx',
        type: 'file' as const,
        content: `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello React Native!</Text>
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
    fontSize: 20,
    fontWeight: 'bold',
  },
});`,
      },
      {
        id: 'package-1',
        name: 'package.json',
        type: 'file' as const,
        content: JSON.stringify(
          {
            name: 'my-app',
            version: '1.0.0',
            main: 'App.tsx',
            dependencies: {
              react: '^18.0.0',
              'react-native': '^0.72.0',
            },
          },
          null,
          2
        ),
      },
    ],
  },
  counter: {
    name: 'Counter App',
    files: [
      {
        id: 'app-1',
        name: 'App.tsx',
        type: 'file' as const,
        content: `import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Counter App</Text>
      <Text style={styles.count}>{count}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setCount(count - 1)}
        >
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setCount(count + 1)}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={[styles.button, styles.resetButton]} 
        onPress={() => setCount(0)}
      >
        <Text style={styles.buttonText}>Reset</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  count: {
    fontSize: 72,
    fontWeight: 'bold',
    marginVertical: 30,
    color: '#007AFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
});`,
      },
      {
        id: 'package-1',
        name: 'package.json',
        type: 'file' as const,
        content: JSON.stringify(
          {
            name: 'counter-app',
            version: '1.0.0',
            main: 'App.tsx',
            dependencies: {
              react: '^18.0.0',
              'react-native': '^0.72.0',
            },
          },
          null,
          2
        ),
      },
    ],
  },
  todo: {
    name: 'Todo App',
    files: [
      {
        id: 'app-1',
        name: 'App.tsx',
        type: 'file' as const,
        content: `import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet 
} from 'react-native';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState('');

  const addTodo = () => {
    if (inputText.trim()) {
      setTodos([
        ...todos,
        { id: Date.now().toString(), text: inputText, completed: false },
      ]);
      setInputText('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo App</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Add a new task..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.addButton} onPress={addTodo}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={todos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <TouchableOpacity
              style={styles.todoContent}
              onPress={() => toggleTodo(item.id)}
            >
              <View
                style={[
                  styles.checkbox,
                  item.completed && styles.checkboxCompleted,
                ]}
              />
              <Text
                style={[
                  styles.todoText,
                  item.completed && styles.todoTextCompleted,
                ]}
              >
                {item.text}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTodo(item.id)}>
              <Text style={styles.deleteButton}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  todoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: '#007AFF',
  },
  todoText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  deleteButton: {
    color: '#FF3B30',
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
});`,
      },
      {
        id: 'package-1',
        name: 'package.json',
        type: 'file' as const,
        content: JSON.stringify(
          {
            name: 'todo-app',
            version: '1.0.0',
            main: 'App.tsx',
            dependencies: {
              react: '^18.0.0',
              'react-native': '^0.72.0',
            },
          },
          null,
          2
        ),
      },
    ],
  },
};

// Get all projects from localStorage
export function getAllProjects(): Project[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
}

// Save all projects to localStorage
function saveProjects(projects: Project[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving projects:', error);
  }
}

// Get a single project by ID
export function getProject(id: string): Project | null {
  const projects = getAllProjects();
  return projects.find(p => p.id === id) || null;
}

// Create a new project
export function createProject(
  name: string,
  template: keyof typeof TEMPLATES,
  description?: string
): Project {
  const templateData = TEMPLATES[template];
  const now = new Date().toISOString();
  
  const project: Project = {
    id: `project-${Date.now()}`,
    name,
    description,
    template,
    createdAt: now,
    updatedAt: now,
    files: templateData.files,
    isArchived: false,
  };

  const projects = getAllProjects();
  projects.push(project);
  saveProjects(projects);

  return project;
}

// Update an existing project
export function updateProject(id: string, updates: Partial<Project>): void {
  const projects = getAllProjects();
  const index = projects.findIndex(p => p.id === id);
  
  if (index !== -1) {
    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveProjects(projects);
  }
}

// Delete a project
export function deleteProject(id: string): void {
  const projects = getAllProjects();
  const filtered = projects.filter(p => p.id !== id);
  saveProjects(filtered);
}

// Archive a project
export function archiveProject(id: string): void {
  updateProject(id, { isArchived: true });
}

// Unarchive a project
export function unarchiveProject(id: string): void {
  updateProject(id, { isArchived: false });
}

// Get current (non-archived) projects
export function getCurrentProjects(): Project[] {
  return getAllProjects().filter(p => !p.isArchived);
}

// Get archived projects
export function getArchivedProjects(): Project[] {
  return getAllProjects().filter(p => p.isArchived);
}

// Update project files
export function updateProjectFiles(id: string, files: FileNode[]): void {
  updateProject(id, { files });
}

// Get template options
export function getTemplateOptions() {
  return Object.entries(TEMPLATES).map(([key, value]) => ({
    value: key,
    label: value.name,
  }));
}