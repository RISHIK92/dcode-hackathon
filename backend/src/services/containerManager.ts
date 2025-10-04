import Docker from "dockerode";
import path from "path";
import fs from "fs-extra";

// Initialize Dockerode to connect to the Docker daemon
// (ensure Docker is running on your machine)
const docker = new Docker();

// In-memory store for active sessions. In a real-world scenario,
// this might be a Redis store or a database table.
const activeSessions = new Map<string, Docker.Container>();

const DOCKER_IMAGE = "react-native-emulator:latest"; // The name of your pre-built Docker image

/**
 * Prepares the project code on the local filesystem.
 * @param userId - The ID of the user.
 * @param projectId - The ID of the project.
 * @param code - The code content from the database.
 * @returns The absolute path to the host directory.
 */
const prepareProjectDirectory = async (
  userId: string,
  projectId: string,
  code: string
): Promise<string> => {
  // Create a unique, isolated directory on the host machine
  const hostPath = path.resolve(
    __dirname,
    `../../user_data/${userId}/${projectId}`
  );

  // Ensure the directory exists and is empty
  await fs.ensureDir(hostPath);
  await fs.emptyDir(hostPath);

  // Write the project code into a main file (e.g., App.js)
  // In a real app, you might write multiple files (package.json, etc.)
  await fs.writeFile(path.join(hostPath, "App.js"), code);

  return hostPath;
};

/**
 * Starts a new Docker container for a specific project.
 * @param userId - The ID of the user.
 * @param projectId - The ID of the project.
 * @param projectCode - The code to run in the container.
 * @returns The ID of the newly created container.
 */
export const startContainer = async (
  userId: string,
  projectId: string,
  projectCode: string
): Promise<string> => {
  // If a session for this project already exists, stop and remove it first for a clean start
  if (activeSessions.has(projectId)) {
    await stopContainer(projectId);
  }

  const hostPath = await prepareProjectDirectory(
    userId,
    projectId,
    projectCode
  );

  console.log(`Mounting host path: ${hostPath} to container`);

  const container = await docker.createContainer({
    Image: DOCKER_IMAGE,
    Env: [
      // <-- ADD THIS
      `PROJECT_ID=${projectId}`,
      `SIGNALING_SERVER_URL=ws://host.docker.internal:3001`, // 'host.docker.internal' is a special DNS name for the host machine from within a Docker container
    ],
    HostConfig: {
      Binds: [`${hostPath}:/app/src`],
      Privileged: true,
    },
  });

  await container.start();

  console.log(`Container ${container.id} started for project ${projectId}`);

  // Store the active session
  activeSessions.set(projectId, container);

  return container.id;
};

/**
 * Stops and removes the Docker container for a specific project.
 * @param projectId - The ID of the project.
 */
export const stopContainer = async (projectId: string): Promise<void> => {
  const container = activeSessions.get(projectId);
  if (container) {
    try {
      await container.stop();
      await container.remove();
      console.log(
        `Container ${container.id} stopped and removed for project ${projectId}`
      );
    } catch (error: any) {
      // It's possible the container was already stopped or removed.
      if (error.statusCode !== 404 && error.statusCode !== 304) {
        console.error(
          `Failed to stop container for project ${projectId}:`,
          error
        );
      }
    } finally {
      activeSessions.delete(projectId);
    }
  }
};
