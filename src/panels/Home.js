import React, { useState } from "react";
import { Panel, PanelHeader, Button, Div } from "@vkontakte/vkui";

const questions = [
    {
        question: "Насколько он хороший друг?",
        answers: ["⭐", "⭐⭐", "⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"]
    },
    {
        question: "Можно ли на него положиться?",
        answers: ["Нет", "Иногда", "Да"]
    },
    {
        question: "Он веселый?",
        answers: ["Нет", "Иногда", "Очень"]
    },
    {
        question: "Он романтичный?",
        answers: ["Нет", "Немного", "Очень"]
    }
];

export const Home = ({ id }) => {

    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState([]);

    function choose(answer) {

        setAnswers([...answers, answer]);

        if (step + 1 < questions.length) {
            setStep(step + 1);
        } else {
            alert("Опрос отправлен!");
        }

    }

    return (

        <Panel id={id}>

            <PanelHeader>
                Что думают друзья
            </PanelHeader>

            <Div>

                <h3>{questions[step].question}</h3>

                {questions[step].answers.map((a) => (
                    <Button
                        key={a}
                        size="l"
                        stretched
                        style={{ marginBottom: 10 }}
                        onClick={() => choose(a)}
                    >
                        {a}
                    </Button>
                ))}

            </Div>

        </Panel>

    );

};