import prisma from "../services/db.js";
/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private
 */
export const createProject = async (req, res) => {
    const { name } = req.body;
    const userId = req.user?.id;
    if (!name) {
        return res.status(400).json({ error: "Project name is required." });
    }
    try {
        const project = await prisma.project.create({
            data: {
                name,
                userId: userId,
            },
        });
        // As requested, send back the new project's ID
        res.status(201).json({
            message: "Project created successfully",
            projectId: project.id,
            project, // Also sending the full project object is good practice
        });
    }
    catch (error) {
        console.error("Create Project Error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};
/**
 * @desc    Get all projects for the logged-in user
 * @route   GET /api/projects
 * @access  Private
 */
export const getProjects = async (req, res) => {
    const userId = req.user?.id;
    try {
        const projects = await prisma.project.findMany({
            where: { userId: userId },
            orderBy: {
                updatedAt: "desc",
            },
        });
        res.status(200).json(projects);
    }
    catch (error) {
        console.error("Get Projects Error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};
/**
 * @desc    Update a project's name
 * @route   PUT /api/projects/:id
 * @access  Private
 */
export const updateProjectName = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user?.id;
    if (!name) {
        return res.status(400).json({ error: "New project name is required." });
    }
    try {
        // First, verify the project exists and belongs to the user
        const project = await prisma.project.findFirst({
            where: { id, userId: userId },
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
    }
    catch (error) {
        console.error("Update Project Error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};
/**
 * @desc    Delete a project
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
export const deleteProject = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    try {
        // Verify the project exists and belongs to the user before deleting
        const project = await prisma.project.findFirst({
            where: { id, userId: userId },
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
    }
    catch (error) {
        console.error("Delete Project Error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};
// We can add getProjectById as well for completeness
export const getProjectById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    try {
        const project = await prisma.project.findFirst({
            where: { id, userId: userId },
        });
        if (!project) {
            return res
                .status(404)
                .json({ error: "Project not found or you do not have access." });
        }
        res.status(200).json(project);
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
};
export const updateProjectCode = async (req, res) => {
    const { id } = req.params; // The ID of the project to update
    const { code } = req.body; // The new code from the user's editor
    const userId = req.user?.id;
    // 1. Basic Validation: Ensure the 'code' field was actually sent.
    // We allow an empty string "" but not a missing field.
    if (code === undefined) {
        return res.status(400).json({ error: 'The "code" field is required.' });
    }
    try {
        // 2. Authorization: Verify that the project exists and belongs to the user making the request.
        // This is the most important security step.
        const project = await prisma.project.findFirst({
            where: {
                id: id,
                userId: userId,
            },
        });
        if (!project) {
            return res
                .status(404)
                .json({
                error: "Project not found or you do not have permission to edit it.",
            });
        }
        // 3. Database Update: If authorization passes, update the project's code.
        const updatedProject = await prisma.project.update({
            where: {
                id: id,
            },
            data: {
                code: code,
            },
        });
        // 4. Success Response: Send a confirmation back to the client.
        res.status(200).json({
            message: "Project code updated successfully.",
            project: updatedProject, // Sending back the updated project is good practice
        });
    }
    catch (error) {
        console.error("Update Project Code Error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};
