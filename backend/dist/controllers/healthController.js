export const healthCheck = (req, res) => {
    res.json({ status: "OK", message: "Backend is running 🚀" });
};
