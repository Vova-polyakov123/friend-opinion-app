function QuestionCard({ question, onAnswer }) {

    return (

        <div className="question-card">

            <h3>{question.text}</h3>

            {question.answers.map((a, i) => (

                <button
                    key={i}
                    onClick={() => onAnswer(question.text, a)}
                >

                    {a}

                </button>

            ))}

        </div>

    )

}

export default QuestionCard