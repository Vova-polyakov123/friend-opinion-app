import axios from "axios"

export async function sendAnswer(data) {

    return axios.post("/api/send", data)

}

export async function getAnswers(user) {

    return axios.get("/api/get?user=" + user)

}

export async function getRating() {

    return axios.get("/api/rating")

}