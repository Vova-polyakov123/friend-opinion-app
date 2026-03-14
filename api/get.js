let answers = []

export default function handler(req, res) {

    const user = req.query.user

    const result = answers.filter(a => a.to == user)

    res.json({ answers: result })

}