import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import { BASE_URL } from './Apiconstants';

function ChatRoom({ loggedInUser }) {

    const [message, setMessage] = useState("");
    const [conversationId, setConversationId] = useState(0)
    const [conversationMessages, setConversationMessages] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");

    const fetchConversationData = () => {
        fetch(`${BASE_URL}/chat/createconversation`, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                userId: loggedInUser.id,
            })
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
            })
            .then(data => {
                console.log(data[0].id);
                setConversationId(data[0].id);
            })
    }

    const getAllUsers = () => {
        fetch(`${BASE_URL}/user/getallusers`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Something went wrong");
                }
            })
            .then(responseData => {
                setAllUsers(responseData)
                console.log(responseData)
            })
            
            .catch(error => {
                console.log(error.message);
                setAllUsers([]);
            })
    }

    const sendMessage = () => {
        fetch(`${BASE_URL}/chat/sendmessage`, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                userId: loggedInUser.id,
                conversationId: conversationId,
                message: message
            })
        })
    }

    const fetchConversationMessages = () => {
        fetch(`${BASE_URL}/chat/getconversationmessages/${conversationId}`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Something went wrong");
                }
            })
            .then(responseData => {
                console.log(responseData)
                setConversationMessages(responseData)
            })
    }

    const adminSendMessage = () => {
        fetch(`${BASE_URL}/chat/adminsendmessage`, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                userId: loggedInUser.id,
                conversationId: selectedUser,
                message: message
            })
        })
    }

    const adminOpenConversation = () => {
        
    }

    useEffect(() => {
        fetchConversationData()
    }, [])

    useEffect(() => {
        getAllUsers();
        console.log(allUsers)
    }, [])

    const handleUserChange = (event) => {
        setSelectedUser(event.target.value);
    }

    return (
        <>
            <div style={{ textAlign: "center" }}>
                <h1>Chatti XD</h1>
                <p>Kirjautunut käyttäjä: {loggedInUser.email}</p>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <TextField
                        label="Lähetä viesti"
                        onChange={e => setMessage(e.target.value)}
                    ></TextField>
                    <Button onClick={() => sendMessage()}>Lähetä</Button>
                    <Button onClick={() => fetchConversationMessages()}>Viestiketju</Button>
                    {loggedInUser.role === "ADMIN" && <Button onClick={() => adminSendMessage()}>Admin Lähetä Viesti</Button>}
                    {loggedInUser.role === "ADMIN" && <Button onClick={() => adminOpenConversation()}>Admin Avaa Viestiketju</Button>}
                    <ul>
                        {conversationMessages.map(message => (
                            <li key={message.id}>
                                <strong>Sender:</strong> {message.sender_id}<br />
                                <strong>Message:</strong> {message.message}<br />
                                <strong>Created At:</strong> {message.created_at}
                            </li>
                        ))}
                    </ul>
                    <div>
                        <select value={selectedUser} onChange={handleUserChange}>
                            <option value="">Select User</option>
                            {allUsers.map(user => (
                                <option key={user.id} value={user.id}>{user.email}</option>
                            ))}
                        </select>
                        {selectedUser && (
                            <p>Selected User: {selectedUser}</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default ChatRoom;