import bridge from "@vkontakte/vk-bridge"

export async function initVK() {

    await bridge.send("VKWebAppInit")

    const user = await bridge.send("VKWebAppGetUserInfo")

    return user

}

export async function selectFriend() {

    const data = await bridge.send("VKWebAppShowFriendsBox")

    if (data.users) {
        return data.users[0]
    }

    return null

}

export async function inviteFriends() {

    await bridge.send("VKWebAppShowInviteBox")

}

export async function shareStory() {

    await bridge.send("VKWebAppShowStoryBox", {

        background_type: "image",
        url: window.location.origin + "/story.png",
        attachment: {
            text: "Узнай что друзья думают о тебе 👀"
        }

    })

}

export async function payVotes(app_id, amount) {

    await bridge.send("VKWebAppOpenPayForm", {

        app_id,
        action: "pay-to-service",

        params: {
            amount
        }

    })

}