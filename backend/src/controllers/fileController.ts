import { Response } from "express";
import { AuthRequest } from "../middleware/middleware";
import prisma from "../services/db.js";

// Helper function to check project ownership
const checkProjectOwnership = async (projectId: string, userId: string) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  return !!project;
};

/**
 * @desc    Create a new file in a project
 * @route   POST /api/projects/:projectId/files
 */
export const createFile = async (req: AuthRequest, res: Response) => {
  const { projectId } = req.params;
  const { name, content } = req.body;
  const userId = req.user!.id;

  if (!name) {
    return res.status(400).json({ error: "File name is required." });
  }

  try {
    if (!(await checkProjectOwnership(projectId, userId))) {
      return res
        .status(404)
        .json({ error: "Project not found or you do not have permission." });
    }

    const newFile = await prisma.file.create({
      data: {
        name,
        content: content || "",
        projectId,
      },
    });

    res.status(201).json(newFile);
  } catch (error) {
    // Handle unique constraint violation (duplicate filename)
    res.status(500).json({
      error:
        "Could not create file. A file with that name might already exist.",
    });
  }
};

/**
 * @desc    Update a file's content
 * @route   PUT /api/projects/:projectId/files/:fileId
 */
export const updateFileContent = async (req: AuthRequest, res: Response) => {
  const { projectId, fileId } = req.params;
  const { content } = req.body;
  const userId = req.user!.id;

  if (content === undefined) {
    return res.status(400).json({ error: "Content field is required." });
  }

  try {
    if (!(await checkProjectOwnership(projectId, userId))) {
      return res
        .status(404)
        .json({ error: "Project not found or you do not have permission." });
    }

    const updatedFile = await prisma.file.update({
      where: { id: fileId },
      data: { content },
    });

    res.status(200).json(updatedFile);
  } catch (error) {
    res.status(500).json({ error: "Could not update file." });
  }
};

/**
 * @desc    Delete a file
 * @route   DELETE /api/projects/:projectId/files/:fileId
 */
export const deleteFile = async (req: AuthRequest, res: Response) => {
  const { projectId, fileId } = req.params;
  const userId = req.user!.id;

  try {
    if (!(await checkProjectOwnership(projectId, userId))) {
      return res
        .status(404)
        .json({ error: "Project not found or you do not have permission." });
    }

    await prisma.file.delete({
      where: { id: fileId },
    });

    res.status(200).json({ message: "File deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Could not delete file." });
  }
};
