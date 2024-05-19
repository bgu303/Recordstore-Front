import { useState, useEffect, useRef } from 'react';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import { BASE_URL, BASE_URL_CLOUD } from './Apiconstants';
import socket from './socket';

function ChatRoom({ loggedInUser, conversationId, setConversationId, conversationMessages, setConversationMessages, fetchConversationId, fetchConversationMessages, newMessageState, setNewMessageState  }) {
    const [message, setMessage] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const messagesEndRef = useRef(null);

    const adminFetchConversationId = () => {
        if (loggedInUser.role === "USER") {
            return;
        }

        fetch(`${BASE_URL}/chat/getconversationid/${selectedUser}`)
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
                const filteredUsers = responseData.filter(user => user.id != localStorage.getItem("loggedInUserId"));
                setAllUsers(filteredUsers)
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
        socket.emit("sendMessage", { message: message, sender_id: loggedInUser.id, conversationId: conversationId });
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
                message: message,
            })
        })
        setMessage("");
        socket.emit("sendMessage", { message: message, sender_id: loggedInUser.id, conversationId: conversationId });
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
                setConversationMessages(responseData)
            })
        adminFetchConversationId();
    }

    //Used to get all users to the drop down menu that admin uses to choose which conversation to open.
    //FIX LATER MAYBE!! Should be called only when admin is logged in.
    useEffect(() => {
        if (localStorage.getItem("loggedInUserRole") === "ADMIN") {
            getAllUsers();
        }
    }, [])

    //Fetches the conversation id, it is needed in order to fetch the conversation messages later based on the conversation id.
    useEffect(() => {
        fetchConversationId();
    }, [])

    //This fetches the conversation messages and is called every time conversation id changes, so in theory it should automatically open the chat.
    useEffect(() => {
        fetchConversationMessages();
    }, [conversationId])

    //Used for automatically open the correct conversation for admin.
    useEffect(() => {
        if (selectedUser.length !== 0) {
            adminOpenConversation();
        }
    }, [selectedUser])

    useEffect(() => {
        scrollToBottom();
    }, [conversationMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleUserChange = (event) => {
        setSelectedUser(event.target.value);
    }

    const handleKeyPress = (e) => {
        if (loggedInUser.role === "ADMIN") {
            if (e.keyCode === 13) {
                adminSendMessage();
                return;
            }
        }
        if (e.keyCode === 13) {
            sendMessage();
        }
    }

    useEffect(() => {
        setNewMessageState(false)
    }, [])

    return (
        <>
            <div style={{ textAlign: "center" }}>
                <h1>Chatti</h1>
                <p>Kirjautunut käyttäjä: {loggedInUser.email}</p>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ border: "1px solid #ccc", borderRadius: "5px", padding: "10px", maxHeight: "500px", overflowY: "auto", width: "400px", marginBottom: "20px" }}>
                        {conversationMessages.map((message, index) => (
                            <div key={index} style={{ marginBottom: "10px", textAlign: message.sender_id === loggedInUser.id ? "right" : "left" }}>
                                <div style={{ padding: "5px", backgroundColor: message.sender_id === loggedInUser.id ? "#DCF8C6" : "#E0E0E0", borderRadius: "5px", display: "inline-block" }}>
                                    <strong>{message.sender_id === loggedInUser.id ? "You" : message.sender_id === 14 ? "PoppiMikko" : message.sender_id}</strong><br />
                                    {message.message}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <TextField
                        label="Lähetä viesti"
                        onChange={e => setMessage(e.target.value)}
                        value={message}
                        onKeyDown={handleKeyPress}
                    ></TextField>
                    {loggedInUser.role === "USER" && <Button style={{ marginTop: 10 }} variant="contained" color="success" onClick={() => sendMessage()}>Lähetä</Button>}
                    {loggedInUser.role === "ADMIN" && <Button style={{ marginTop: 10 }} variant="contained" color="success" onClick={() => adminSendMessage()}>Lähetä Viesti</Button>}
                    {loggedInUser.role === "ADMIN" && <Button style={{ marginTop: 10 }} variant="contained" onClick={() => adminOpenConversation()}>Avaa Viestiketju Henkilön Kanssa</Button>}
                    {loggedInUser.role === "ADMIN" && <div>
                        <select
                            style={{
                                padding: 10,
                                fontSize: 14,
                                border: "1px solid #ccc",
                                borderRadius: 5,
                                width: '100%',
                                marginBottom: 5,
                                marginTop: 10
                            }}
                            value={selectedUser} onChange={handleUserChange}>
                            <option value="">Valitse käyttäjä kenen kanssa chatata</option>
                            {allUsers.map(user => (
                                <option key={user.id} value={user.id}>{user.email}</option>
                            ))}
                        </select>
                    </div>}
                </div>
            </div>
        </>
    );
}

export default ChatRoom;