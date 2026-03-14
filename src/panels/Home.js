import bridge from "@vkontakte/vk-bridge"

function Home({ start }) {

    const shareStory = async () => {

        await bridge.send("VKWebAppShowStoryBox", {

            background_type: "image",
            url: window.location.origin + "/story.png"

        })

    }

    return (

        <div>

            <h1>Оцени друзей</h1>

            <button onClick={start}>
                Начать
            </button>

            <button onClick={shareStory}>
                Поделиться в сторис
            </button>

        </div>

    )

}

export default Home