import { useState, useEffect, useRef } from 'react';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import socket from './socket';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from "react-router-dom";
import { format } from 'date-fns';
import '../styling/Chat.css';

import { BASE_URL, BASE_URL_CLOUD } from './Apiconstants';

function ChatRoom({ loggedInUser, conversationId, setConversationId, conversationMessages, setConversationMessages, fetchConversationId, fetchConversationMessages, newMessageState, setNewMessageState, adminNewMessageIds, setAdminNewMessageIds }) {
    const [message, setMessage] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const messagesEndRef = useRef(null);
    const token = localStorage.getItem("jwtToken");
    const navigate = useNavigate();
    const currentTime = new Date().toISOString(); // This will give the current time in ISO 8601 format
    const SYSTEM_USER_ID = 58; // This is the ID for System messages. CHANGE IF NEEDED
    const POPPI_MIKKO_ID = 14; // This is the ID for PoppiMikko, CHANGE IF POPPIMIKKO USERID CHANGES

    useEffect(() => {
        if (!localStorage.getItem("isLoggedIn")) {
            navigate("/records")
        }
    }, [])

    const adminFetchConversationId = () => {
        if (loggedInUser.role === "USER") {
            return;
        }

        fetch(`${BASE_URL_CLOUD}/chat/getconversationid/${selectedUser}`)
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
        fetch(`${BASE_URL_CLOUD}/user/getallusers`)
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

        fetch(`${BASE_URL_CLOUD}/chat/sendmessage`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: loggedInUser.id,
                conversationId: conversationId,
                message: message
            })
        })
        setMessage("");
        socket.emit("sendMessage", { message: message, sender_id: loggedInUser.id, conversationId: conversationId, created_at: currentTime });
    }

    const adminSendMessage = () => {
        if (message.trim() === "") {
            return alert("Ei tyhjiä viestejä.");
        }

        fetch(`${BASE_URL_CLOUD}/chat/adminsendmessage`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: loggedInUser.id,
                selectedUser: selectedUser,
                message: message,
            })
        })
        setMessage("");
        socket.emit("sendMessage", { message: message, sender_id: loggedInUser.id, conversationId: conversationId, created_at: currentTime });
    }

    const adminOpenConversation = () => {
        fetch(`${BASE_URL_CLOUD}/chat/admingetconversationmessages/${selectedUser}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
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
        //Filter the adminNewMessageIds, if chat is opened -> remove id from list --> color of the notification in the chat list turns off.
        const updatedMessageIds = adminNewMessageIds.filter(id => id != event.target.value);
        setSelectedUser(event.target.value);
        setAdminNewMessageIds(updatedMessageIds);
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
    }, [newMessageState])

    useEffect(() => {
        return () => {
            if (localStorage.getItem("loggedInUserRole") === "ADMIN") {
                return;
            }

            fetch(`${BASE_URL_CLOUD}/chat/chatmessagechecker/${conversationId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Something went wrong.");
                    }
                    return response.json();
                })
                .then(responseData => {
                    console.log(responseData);
                })
                .catch(error => {
                    console.error("There was a problem with the fetch operation:", error);
                });
        };
    }, []);

    const convertNewlinesToBr = (text) => {
        return text.replace(/\n/g, '<br>');
    };

    return (
        <>
            <div className="chat-container">
                <h2 className="chatTitle">Chatti</h2>
                <p className="chatParagraph"><b>Tämä Chat on tarkoitettu vain levykauppojen hoitoon. Jos haluat jutella muista asioista, ota PoppiMikkoon yhteyttä toisen sosiaalimedian kautta.</b></p>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div className="chat-box">
                        {conversationMessages.map((message, index) => (
                            <div
                                key={index}
                                className={`message ${message.sender_id === loggedInUser.id
                                        ? 'message-right'
                                        : message.sender_id === SYSTEM_USER_ID
                                            ? 'message-system'
                                            : ''
                                    }`}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems:
                                            message.sender_id === loggedInUser.id
                                                ? "flex-end"
                                                : message.sender_id === SYSTEM_USER_ID
                                                    ? "center"
                                                    : "flex-start",
                                    }}
                                >
                                    <div
                                        className={`message-content ${message.sender_id === loggedInUser.id
                                                ? 'message-sent'
                                                : message.sender_id === SYSTEM_USER_ID
                                                    ? 'message-system-content'
                                                    : 'message-received'
                                            }`}
                                    >
                                        <strong
                                            style={{
                                                fontSize: "18px",
                                                color: message.sender_id === SYSTEM_USER_ID ? "#FF5733" : "#333",
                                            }}
                                        >
                                            {message.sender_id === loggedInUser.id
                                                ? "Sinä"
                                                : message.sender_id === SYSTEM_USER_ID
                                                    ? "Järjestelmä"
                                                    : message.sender_id === POPPI_MIKKO_ID
                                                        ? "PoppiMikko"
                                                        : ""}
                                        </strong>
                                        <span
                                            style={{
                                                fontSize: "16px",
                                                color: "black",
                                                marginTop: "5px",
                                                display: "block",
                                                textAlign: "left"
                                            }}
                                            dangerouslySetInnerHTML={{ __html: convertNewlinesToBr(message.message) }}
                                        />
                                    </div>
                                    <div
                                        className={`message-time ${message.sender_id === SYSTEM_USER_ID ? 'message-time-system' : ''
                                            }`}
                                    >
                                        {format(new Date(message.created_at), 'dd.MM.yyyy HH:mm')}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={{ display: "flex", alignItems: "center" }}>
                        <TextField
                            label="Lähetä viesti"
                            onChange={e => setMessage(e.target.value)}
                            value={message}
                            onKeyDown={handleKeyPress}
                        />
                        {loggedInUser.role === "USER" && (
                            <IconButton
                                style={{ marginLeft: 10 }}
                                color="success"
                                onClick={() => sendMessage()}
                            >
                                <SendIcon />
                            </IconButton>
                        )}
                        {loggedInUser.role === "ADMIN" && (
                            <IconButton
                                style={{ marginLeft: 10 }}
                                color="success"
                                onClick={() => adminSendMessage()}
                            >
                                <SendIcon />
                            </IconButton>
                        )}
                    </div>
                    {loggedInUser.role === "ADMIN" && (
                        <div>
                            <select
                                className="select-user"
                                value={selectedUser}
                                onChange={handleUserChange}
                            >
                                <option value="">Valitse käyttäjä kenen kanssa chatata</option>
                                {allUsers.map(user => (
                                    <option
                                        key={user.id}
                                        value={user.id}
                                        style={adminNewMessageIds.includes(user.id) ? { backgroundColor: "#f52b5d" } : {}}
                                    >
                                        {user.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>
        </>
    );

}

export default ChatRoom;