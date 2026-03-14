let answers = []

export default function handler(req, res) {

    const { from, to, question, answer } = req.body

    answers.push({

        from,
        to,
        question,
        answer,
        time: Date.now()

    })

    res.json({ success: true })

}