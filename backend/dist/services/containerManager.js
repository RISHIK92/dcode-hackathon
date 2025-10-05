import Docker from "dockerode";
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
// Initialize Dockerode to connect to the Docker daemon
// (ensure Docker is running on your machine)
const docker = new Docker();
// In-memory store for active sessions. In a real-world scenario,
// this might be a Redis store or a database table.
const activeSessions = new Map();
const DOCKER_IMAGE = "react-native-emulator:latest"; // The name of your pre-built Docker image
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Prepares the project code on the local filesystem.
 * @param userId - The ID of the user.
 * @param projectId - The ID of the project.
 * @param code - The code content from the database.
 * @returns The absolute path to the host directory.
 */
const prepareProjectDirectory = async (userId, projectId, files) => {
    const hostPath = path.resolve(__dirname, `../../user_data/${userId}/${projectId}`);
    await fs.ensureDir(hostPath);
    await fs.emptyDir(hostPath);
    // This loop correctly handles file paths like `app/index.js` and `app/components/MyComponent.js`
    for (const file of files) {
        const filePath = path.join(hostPath, file.name);
        await fs.ensureFile(filePath); // Creates directories if they don't exist
        await fs.writeFile(filePath, file.content);
    }
    console.log(`Prepared ${files.length} files in ${hostPath}`);
    return hostPath;
};
/**
 * Starts a new Docker container for a specific project.
 * @param userId - The ID of the user.
 * @param projectId - The ID of the project.
 * @param projectCode - The code to run in the container.
 * @returns The ID of the newly created container.
 */
export const startContainer = async (userId, projectId, projectFiles) => {
    // If a session for this project already exists, stop and remove it first for a clean start
    if (activeSessions.has(projectId)) {
        await stopContainer(projectId);
    }
    const hostPath = await prepareProjectDirectory(userId, projectId, projectFiles);
    console.log(`Mounting host path: ${hostPath} to container`);
    const container = await docker.createContainer({
        Image: DOCKER_IMAGE,
        Env: [
            `PROJECT_ID=${projectId}`,
            `SIGNALING_SERVER_URL=ws://host.docker.internal:3001`,
        ],
        HostConfig: {
            Binds: [`${hostPath}:/app/user_code`],
            ExtraHosts: ["host.docker.internal:host-gateway"],
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
export const stopContainer = async (projectId) => {
    const container = activeSessions.get(projectId);
    if (container) {
        try {
            await container.stop();
            await container.remove();
            console.log(`Container ${container.id} stopped and removed for project ${projectId}`);
        }
        catch (error) {
            // It's possible the container was already stopped or removed.
            if (error.statusCode !== 404 && error.statusCode !== 304) {
                console.error(`Failed to stop container for project ${projectId}:`, error);
            }
        }
        finally {
            activeSessions.delete(projectId);
        }
    }
};
