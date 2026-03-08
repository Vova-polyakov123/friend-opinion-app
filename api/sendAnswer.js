export default function handler(req, res) {
    if (req.method === "POST") {
        const { user, answer } = req.body;

        console.log("Answer:", user, answer);

        res.status(200).json({ success: true });
    }
}