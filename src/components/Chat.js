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

    const fetchConversationId = () => {
        if (loggedInUser.role === "ADMIN") {
            return;
        }

        fetch(`${BASE_URL}/chat/getconversationid/${loggedInUser.id}`)
            .then(response => {
                if (response.ok) {
                    return response.json()
                }
            })
            .then(data => {
                setConversationId(data[0].id)
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
            })

            .catch(error => {
                console.log(error.message);
                setAllUsers([]);
            })
    }

    const sendMessage = () => {
        if (message.trim() === "") {
            return alert("Ei tyhjiä viestejä.");
        }

        fetch(`${BASE_URL}/chat/sendmessage`, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                userId: loggedInUser.id,
                conversationId: conversationId,
                message: message
            })
        })
        setMessage("");
    }

    const adminSendMessage = () => {
        if (message.trim() === "") {
            return alert("Ei tyhjiä viestejä.");
        }

        fetch(`${BASE_URL}/chat/adminsendmessage`, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                userId: loggedInUser.id,
                selectedUser: selectedUser,
                message: message
            })
        })
        setMessage("");
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

    const adminOpenConversation = () => {
        fetch(`${BASE_URL}/chat/admingetconversationmessages/${selectedUser}`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Something went wrong")
                }
            })
            .then(responseData => {
                console.log(responseData)
                setConversationMessages(responseData)
            })
    }

    //Fetches the conversation id, it is needed in order to fetch the conversation messages.
    useEffect(() => {
        fetchConversationId();
    }, [])

    //This fetches the conversation messages and is called every time conversation id changes, so in theory it should automatically open the chat.
    //Doesn't update the chat automatically though, just opens it
    useEffect(() => {
        fetchConversationMessages();
    }, [conversationId])

    //Used to get all users to the drop down menu that admin uses to choose which conversation to open.
    //FIX LATER MAYBE!! Should be called only when admin is logged in.
    useEffect(() => {
        getAllUsers();
    }, [])

    //Used for automatically open the correct conversation for admin. CRASHES!!! if you choose admin
    //As the message recipient. Need to delete admin from the listing later.
    useEffect(() => {
        if (selectedUser.length !== 0) {
            adminOpenConversation();
        }
    }, [selectedUser])

    const handleUserChange = (event) => {
        setSelectedUser(event.target.value);
    }

    return (
        <>
            <div style={{ textAlign: "center" }}>
                <h1>Chatti XD</h1>
                <p>Kirjautunut käyttäjä: {loggedInUser.email}</p>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ border: "1px solid #ccc", borderRadius: "5px", padding: "10px", maxHeight: "800px", overflowY: "auto", width: "400px", marginBottom: "20px" }}>
                        {conversationMessages.map((message, index) => (
                            <div key={index} style={{ marginBottom: "10px", textAlign: message.sender_id === loggedInUser.id ? "right" : "left" }}>
                                <div style={{ padding: "5px", backgroundColor: message.sender_id === loggedInUser.id ? "#DCF8C6" : "#E0E0E0", borderRadius: "5px", display: "inline-block" }}>
                                    <strong>{message.sender_id === loggedInUser.id ? "You" : message.sender_id === 14 ? "PoppiMikko" : message.sender_id}</strong><br />
                                    {message.message}
                                </div>
                            </div>
                        ))}
                    </div>
                    <TextField
                        label="Lähetä viesti"
                        onChange={e => setMessage(e.target.value)}
                        value={message}
                    ></TextField>
                    {loggedInUser.role === "USER" && <Button onClick={() => sendMessage()}>Lähetä</Button>}
                    {loggedInUser.role === "USER" && <Button onClick={() => fetchConversationMessages()}>Viestiketju</Button>}
                    {loggedInUser.role === "ADMIN" && <Button onClick={() => adminSendMessage()}>Lähetä Viesti</Button>}
                    {loggedInUser.role === "ADMIN" && <Button onClick={() => adminOpenConversation()}>Avaa Viestiketju Henkilön Kanssa</Button>}
                    {loggedInUser.role === "ADMIN" && <div>
                        <select value={selectedUser} onChange={handleUserChange}>
                            <option value="">Valitse käyttäjä kenen kanssa chatata</option>
                            {allUsers.map(user => (
                                <option key={user.id} value={user.id}>{user.email}</option>
                            ))}
                        </select>
                        {selectedUser && (
                            <p>Selected User: {selectedUser}</p>
                        )}
                    </div>}
                </div>
            </div>
        </>
    )
}

export default ChatRoom;