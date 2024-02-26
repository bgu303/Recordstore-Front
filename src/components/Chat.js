import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import { BASE_URL } from './Apiconstants';

function ChatRoom({ loggedInUser }) {

    const [message, setMessage] = useState("");

    const sendMessage = () => {
        fetch(`${BASE_URL}/chat/createconversation`, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                userId: loggedInUser.id
            })
        })
    }

    return (
        <>
            <div style={{ textAlign: "center" }}>
                <h1>Chatti XD</h1>
                <p>Kirjautunut käyttäjä: {loggedInUser.email}</p>
                <div style={{ display: "flex", flexDirection: "column",  alignItems: "center" }}>
                    <TextField
                    label="Lähetä viesti"
                    onChange={e => setMessage(e.target.value)}
                    ></TextField>
                    <Button onClick={() => sendMessage()}>Lähetä</Button>
                </div>
            </div>
        </>
    )
}

export default ChatRoom;