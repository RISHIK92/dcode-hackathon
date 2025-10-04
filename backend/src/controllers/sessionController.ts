import { Response } from "express";
import { AuthRequest } from "../middleware/middleware";
import prisma from "../services/db";
import * as containerManager from "../services/containerManager";

/**
 * @desc    Starts a build session for a project
 * @route   POST /api/sessions/:projectId/run
 * @access  Private
 */
export const runProjectSession = async (req: AuthRequest, res: Response) => {
  const { projectId } = req.params;
  const userId = req.user?.id;

  try {
    // 1. Authorize: Verify the project exists and belongs to the user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: userId!,
      },
    });

    if (!project) {
      return res.status(404).json({
        error: "Project not found or you do not have permission to run it.",
      });
    }

    // 2. Delegate to the Container Manager to start the container
    const containerId = await containerManager.startContainer(
      userId!,
      projectId,
      project.code
    );

    // 3. Respond with a session identifier
    res.status(200).json({
      message: "Container started successfully.",
      sessionId: containerId, // Using container ID as session ID for now
      projectId: project.id,
    });
  } catch (error) {
    console.error(`Error starting session for project ${projectId}:`, error);
    res.status(500).json({ error: "Failed to start the container session." });
  }
};

/**
 * @desc    Stops a build session for a project
 * @route   POST /api/sessions/:projectId/stop
 * @access  Private
 */
export const stopProjectSession = async (req: AuthRequest, res: Response) => {
  // (Similar authorization logic as above would be here)
  const { projectId } = req.params;

  try {
    await containerManager.stopContainer(projectId);
    res.status(200).json({ message: "Session stopped successfully." });
  } catch (error) {
    console.error(`Error stopping session for project ${projectId}:`, error);
    res.status(500).json({ error: "Failed to stop the container session." });
  }
};
