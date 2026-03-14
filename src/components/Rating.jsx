function Rating({ users }) {

    return (

        <div>

            <h2>Топ друзей</h2>

            {users.map((u, i) => (

                <div key={i}>

                    #{i + 1} {u.name} — {u.points}

                </div>

            ))}

        </div>

    )

}

export default Rating