import { Response } from "express";
import { AuthRequest } from "../middleware/middleware.js";
import prisma from "../services/db.js";

const DEFAULT_BOILERPLATE_CODE = `import { Text, View, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.subtitle}>Edit app/index.ts to start building your app.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
});
`;

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private
 */
export const createProject = async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  const userId = req.user?.id;

  if (!name) {
    return res.status(400).json({ error: "Project name is required." });
  }

  try {
    // This is a "nested write". It creates the Project and its related File in one operation.
    const project = await prisma.project.create({
      data: {
        name,
        userId: userId!,
        files: {
          create: [
            {
              name: "app/index.ts", // The file path
              content: DEFAULT_BOILERPLATE_CODE,
            },
          ],
        },
      },
      include: {
        files: true, // Return the new project with its files included
      },
    });

    res.status(201).json({
      message: "Project created successfully",
      projectId: project.id,
      project,
    });
  } catch (error) {
    console.error("Create Project Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * @desc    Get all projects for the logged-in user
 * @route   GET /api/projects
 * @access  Private
 */
export const getProjects = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    const projects = await prisma.project.findMany({
      where: { userId: userId! },
      orderBy: {
        updatedAt: "desc",
      },
    });
    res.status(200).json(projects);
  } catch (error) {
    console.error("Get Projects Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * @desc    Update a project's name
 * @route   PUT /api/projects/:id
 * @access  Private
 */
export const updateProjectName = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  const userId = req.user?.id;

  if (!name) {
    return res.status(400).json({ error: "New project name is required." });
  }

  try {
    // First, verify the project exists and belongs to the user
    const project = await prisma.project.findFirst({
      where: { id, userId: userId! },
    });

    if (!project) {
      return res.status(404).json({
        error: "Project not found or you do not have permission to edit it.",
      });
    }

    // Now, update the project
    const updatedProject = await prisma.project.update({
      where: { id },
      data: { name },
    });

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error("Update Project Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * @desc    Delete a project
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
export const deleteProject = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    // Verify the project exists and belongs to the user before deleting
    const project = await prisma.project.findFirst({
      where: { id, userId: userId! },
    });

    if (!project) {
      return res.status(404).json({
        error: "Project not found or you do not have permission to delete it.",
      });
    }

    // Perform the delete operation
    await prisma.project.delete({
      where: { id },
    });

    res.status(200).json({ message: "Project deleted successfully." });
  } catch (error) {
    console.error("Delete Project Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// We can add getProjectById as well for completeness
export const getProjectById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const project = await prisma.project.findFirst({
      where: { id, userId: userId! },
      // IMPORTANT: We now include the files in the response
      include: {
        files: true,
      },
    });

    if (!project) {
      return res
        .status(404)
        .json({ error: "Project not found or you do not have access." });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
};
