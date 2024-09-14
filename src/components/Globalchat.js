import { useEffect, useState, useRef } from "react";
import { TextField } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import socket from './socket';
import { useNavigate } from "react-router-dom";

import { BASE_URL, BASE_URL_CLOUD } from './Apiconstants';

function GlobalChat({ loggedInUser }) {
    const [message, setMessage] = useState("");
    const [allGlobalMessages, setAllGlobalMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const currentTime = new Date().toISOString();
    const token = localStorage.getItem("jwtToken");
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("isLoggedIn")) {
            navigate("/records")
        }
    }, [])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            socket.emit("joinGlobalChat");

            socket.on("sendMessageGlobalChat", (newMessage) => {
                setAllGlobalMessages(prevMessages => [...prevMessages, newMessage]);
            });

            return () => {
                socket.off("sendMessageGlobalChat");
            };
        }, 500);
        return () => clearTimeout(timeoutId);
    }, []);

    useEffect(() => {
        getAllGlobalMessages();
    }, []);

    const getAllGlobalMessages = () => {
        fetch(`${BASE_URL_CLOUD}/chat/getglobalmessages`)
            .then(response => response.json())
            .then(data => {
                setAllGlobalMessages(data);
            });
    };

    const sendMessage = () => {
        if (message.trim() === "") {
            return alert("Ei tyhjiä viestejä.");
        }
        if (message.trim().length > 600) {
            return alert("Ei yli 600 merkin viestejä.");
        }

        fetch(`${BASE_URL_CLOUD}/chat/sendmessageglobal`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: loggedInUser.id,
                message: message
            })
        }).then(() => {
            setMessage("");
            socket.emit("sendMessageGlobalChat", {
                message: message,
                sender_id: loggedInUser.id,
                sender_nickname: localStorage.getItem("loggedInUserNickname"),
                created_at: currentTime
            });
        });
    };

    useEffect(() => {
        scrollToBottom();
    }, [allGlobalMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const convertNewlinesToBr = (text) => {
        return text.replace(/\n/g, '<br>');
    };

    const handleKeyPress = (e) => {
        if (e.keyCode === 13) {
            sendMessage();
        }
    }

    const deleteMessage = (messageId) => {
        fetch(`${BASE_URL_CLOUD}/chat/deletefromglobalchat/${messageId}`, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        }).then(() => {
            socket.emit("messageDeletedGlobalChat", { messageId });
            getAllGlobalMessages();
        });
    };

    const deleteMessageUser = (messageId) => {
        const userId = localStorage.getItem("loggedInUserId") || loggedInUser.id;

        fetch(`${BASE_URL_CLOUD}/chat/deletefromglobalchat/${userId}/${messageId}`, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to delete message");
                }
                return response.json();
            })
            .then(() => {
                socket.emit("messageDeletedGlobalChat", { messageId });
                getAllGlobalMessages();
            })
            .catch(error => {
                console.error("Error deleting message:", error);
            });
    };

    useEffect(() => {
        socket.on("messageDeleted", (data) => {
            const { messageId } = data;

            // Update the state to remove the message from the UI
            setAllGlobalMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
        });

        // Cleanup the event listener on unmount
        return () => {
            socket.off("messageDeleted");
        };
    }, [socket, setAllGlobalMessages]);

    return (
        <>
            <div style={{ textAlign: "center" }}>
                <h2>Julkinen Chatti</h2>
                <h4>Tämä Chatti on tarkoitettu yleiseen jutusteluun musiikista, tai mistä muusta tahansa kaikkien käyttäjien kesken.</h4>
                <h5>Juttelet käyttäjänimellä: {localStorage.getItem("loggedInUserNickname")}</h5>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div className="chat-box">
                    {allGlobalMessages.map((message, index) => {
                        const isJukka = message.user_nickname === "Jukka (Ylläpitäjä)";
                        const isPoppimikko = message.user_nickname === "PoppiMikko";
                        const messageClass = message.user_id === loggedInUser.id ? 'message-right' : 'message-left';

                        const customStyles = isJukka
                            ? {
                                border: "3px solid gold",
                                backgroundColor: "#fff7e6",
                                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
                            }
                            : isPoppimikko
                                ? {
                                    border: "3px solid #0066cc",
                                    backgroundColor: "#e6f0ff",
                                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
                                    color: "#333",
                                }
                                : {};

                        return (
                            <div key={index} className={`message ${messageClass}`}>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: message.user_id === loggedInUser.id ? "flex-end" : "flex-start",
                                    }}
                                >
                                    <div
                                        className={`message-content ${message.user_id === loggedInUser.id ? 'message-sent' : 'message-received'}`}
                                        style={customStyles}
                                    >
                                        <strong
                                            style={{
                                                fontSize: "18px",
                                                color: "#333",
                                            }}
                                        >
                                            {message.user_id === loggedInUser.id ? "Sinä" : message.user_nickname}
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
                                    <div className="message-time">
                                        {format(new Date(message.created_at), 'dd.MM.yyyy HH:mm')}
                                    </div>
                                    {localStorage.getItem("loggedInUserId") == message.user_id && loggedInUser.role !== "ADMIN" && (
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => deleteMessageUser(message.id)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                    {loggedInUser.role === "ADMIN" && (
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => deleteMessage(message.id)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <TextField
                        label="Lähetä viesti"
                        multiline
                        rows={3}
                        onChange={e => setMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        value={message}
                        className="chatTextField"
                    />
                    <IconButton
                        style={{ marginLeft: 10, alignSelf: "center" }}
                        color="success"
                        onClick={() => sendMessage()}
                    >
                        <SendIcon />
                    </IconButton>
                </div>

            </div>
        </>
    );
}

export default GlobalChat;
