import { useState } from "react"

function FriendSearch({ friends, onSelect }) {

    const [search, setSearch] = useState("")

    const filtered = friends.filter(f =>
        (f.first_name + " " + f.last_name)
            .toLowerCase()
            .includes(search.toLowerCase())
    )

    return (

        <div>

            <input
                placeholder="Поиск друга"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            {filtered.map(friend => (

                <div
                    key={friend.id}
                    onClick={() => onSelect(friend)}
                >

                    <img src={friend.photo_100} />

                    {friend.first_name} {friend.last_name}

                </div>

            ))}

        </div>

    )

}

export default FriendSearch