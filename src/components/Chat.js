import { useState, useEffect, useRef } from 'react';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import socket from './socket';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from "react-router-dom";
import { format } from 'date-fns';
import '../styling/Chat.css';

import { BASE_URL } from './Apiconstants';

function ChatRoom({ loggedInUser, conversationId, setConversationId, conversationMessages, setConversationMessages, fetchConversationId, fetchConversationMessages, newMessageState, setNewMessageState, adminNewMessageIds, setAdminNewMessageIds }) {
    const [message, setMessage] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const messagesEndRef = useRef(null);
    const token = localStorage.getItem("jwtToken");
    const navigate = useNavigate();
    const [isAscending, setIsAscending] = useState(true);
    const [sortedUsers, setSortedUsers] = useState(allUsers);
    const [lastMessageTime, setLastMessageTime] = useState(0);
    const [cooldownPeriod, setCooldownPeriod] = useState(15000);
    const currentTime = new Date().toISOString(); // This will give the current time in ISO 8601 format
    const SYSTEM_USER_ID = 58; // This is the ID for System messages. CHANGE IF NEEDED
    const POPPI_MIKKO_ID = 57; // This is the ID for PoppiMikko, CHANGE IF POPPIMIKKO USERID CHANGES

    useEffect(() => {
        if (!localStorage.getItem("isLoggedIn")) {
            navigate("/records")
        }
    }, [])

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
                const loggedInUserId = localStorage.getItem("loggedInUserId");

                const filteredUsers = responseData.filter(user =>
                    user.id != loggedInUserId && user.email !== "Järjestelmä"
                );
                setAllUsers(filteredUsers);
            })
            .catch(error => {
                console.log(error.message);
                setAllUsers([]);
            });
    };

    const sendMessage = () => {
        const currentTime = Date.now();

        if (currentTime - lastMessageTime < cooldownPeriod) {
            const timeLeft = Math.ceil((cooldownPeriod - (currentTime - lastMessageTime)) / 1000);
            return alert(`Voit lähettää uuden viestin ${timeLeft} sekunnin kuluttua.`);
        }

        let trimmedMessage = message.trim();

        if (trimmedMessage === "") {
            return alert("Ei tyhjiä viestejä.");
        }
        if (trimmedMessage.length > 600) {
            return alert("Ei yli 600 merkin viestejä.");
        }

        fetch(`${BASE_URL}/chat/sendmessage`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: loggedInUser.id,
                conversationId: conversationId,
                message: trimmedMessage
            })
        })
        setMessage("");
        setLastMessageTime(currentTime);
        socket.emit("sendMessage", { message: trimmedMessage, sender_id: loggedInUser.id, conversationId: conversationId, created_at: currentTime });
    }

    const adminSendMessage = () => {
        if (message.trim() === "") {
            return alert("Ei tyhjiä viestejä.");
        }

        fetch(`${BASE_URL}/chat/adminsendmessage`, {
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
        fetch(`${BASE_URL}/chat/admingetconversationmessages/${selectedUser}`, {
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
        if (loggedInUser.role === "ADMIN") {
            return setConversationMessages([]);
        }
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

        //These are here as a test for now, this should make the new chat message count better for admin....Hopefully.
        setNewMessageState(false);
    }

    const handleKeyPress = (e) => {
        if (e.keyCode === 13) {
            if (e.shiftKey) {
                e.preventDefault(); // Prevents the default action of the Enter key
                setMessage(message + '\n');
            } else {
                e.preventDefault();
                sendMessage();
            }
        }
    };

    useEffect(() => {
        setNewMessageState(false)
    }, [newMessageState])

    useEffect(() => {
        return () => {
            if (localStorage.getItem("loggedInUserRole") === "ADMIN") {
                return;
            }

            let isMounted = true;

            fetch(`${BASE_URL}/chat/chatmessagechecker/${conversationId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Something went wrong.");
                    }
                    return response.json();
                })
                .then(responseData => {
                    if (isMounted) {
                        console.log(responseData);
                        setNewMessageState(false);
                    }
                })
                .catch(error => {
                    if (isMounted) {
                        console.error("There was a problem with the fetch operation:", error);
                    }
                });

            return () => {
                isMounted = false;
            };
        };
    }, [conversationId]);

    const convertNewlinesToBr = (text) => {
        return text.replace(/\n/g, '<br>');
    };

    // Update sortedUsers when allUsers changes
    useEffect(() => {
        setSortedUsers(allUsers);
    }, [allUsers]);

    // Function to toggle sorting
    const toggleSort = () => {
        const sorted = [...sortedUsers].sort((a, b) => {
            if (isAscending) {
                return a.user_name.localeCompare(b.user_name);
            } else {
                return b.user_name.localeCompare(a.user_name);
            }
        });
        setSortedUsers(sorted);
        setIsAscending(!isAscending);
    };

    useEffect(() => {
        if (localStorage.getItem("loggedInUserRole") === "ADMIN") {
            return;
        }

        if (socket.connected) {
            const messageHandler = (message) => {
                if (message.conversationId === conversationId) {
                    setConversationMessages(prevMessages => [...prevMessages, message]);
                }
            };

            const isListenerAttached = socket.hasListeners?.("message");

            if (!isListenerAttached) {
                socket.on("message", messageHandler);
            }

            return () => {
                socket.off("message", messageHandler);
            };
        }
    }, [conversationId]);

    return (
        <>
            <div className="chat-container" style={{ display: "flex" }}>
                {loggedInUser.role === "ADMIN" && (
                    <div className="user-list">
                        <div style={{ marginBottom: "10px", textAlign: "center" }}>
                            <Button
                                onClick={() => toggleSort()}
                                className="sort-button"
                                variant="contained"
                                size="small"
                            >
                                Aakkosta
                            </Button>
                        </div>
                        <ul style={{ listStyleType: "none", padding: 0 }}>
                            {sortedUsers.map(user => (
                                <li
                                    key={user.id}
                                    onClick={() => handleUserChange({ target: { value: user.id } })}
                                    className={user.id === selectedUser ? 'active-chat' : ''}
                                    style={{
                                        padding: "10px",
                                        backgroundColor: adminNewMessageIds.includes(user.id) ? "#f52b5d" : "transparent",
                                        cursor: "pointer",
                                    }}
                                >
                                    {user.user_name}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <div style={{ width: loggedInUser.role === "ADMIN" ? "80%" : "100%", padding: "10px" }}>
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
                                multiline
                                rows={3}
                                onChange={e => setMessage(e.target.value)}
                                value={message}
                                onKeyDown={handleKeyPress}
                                className="chatTextField"
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
                    </div>
                </div>
            </div>
        </>
    );
}

export default ChatRoom;