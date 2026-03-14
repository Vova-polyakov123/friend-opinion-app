function AnswerList({ answers }) {

    return (

        <div>

            {answers.map((a, i) => (

                <div key={i} className="answer">

                    <p>{a.question}</p>

                    <p>{a.answer}</p>

                </div>

            ))}

        </div>

    )

}

export default AnswerList