import { useEffect, useState, useRef } from "react";
import { TextField } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import { format } from 'date-fns';
import socket from './socket';
import { BASE_URL, BASE_URL_CLOUD } from './Apiconstants';

function GlobalChat({ loggedInUser }) {
    const [message, setMessage] = useState("");
    const [allGlobalMessages, setAllGlobalMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const currentTime = new Date().toISOString();
    const token = localStorage.getItem("jwtToken");

    useEffect(() => {
        // Join global chat room
        socket.emit("joinGlobalChat");

        // Listen for new messages
        socket.on("message", (newMessage) => {
            setAllGlobalMessages(prevMessages => [...prevMessages, newMessage]);
        });

        // Cleanup on component unmount
        return () => {
            socket.off("message");
        };
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
                sender_nickname: loggedInUser.nickname,
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

    return (
        <>
            <h1 style={{ textAlign: "center" }}>Yleinen Chatti</h1>
            <div style={{ textAlign: "center" }}>
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
                            <div
                                key={index}
                                className={`message ${messageClass}`}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: message.user_id === loggedInUser.id ? "flex-end" : "flex-start",
                                    }}
                                >
                                    <div
                                        className={`message-content ${message.user_id === loggedInUser.id ? 'message-sent' : 'message-received'}`}
                                        style={customStyles} // Apply the custom styles here
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
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
                <TextField
                    label="Lähetä viesti"
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    value={message}
                    className="chatTextField"
                />
                <IconButton
                    style={{ marginLeft: 10 }}
                    color="success"
                    onClick={() => sendMessage()}
                >
                    <SendIcon />
                </IconButton>
            </div>
        </>
    );
}

export default GlobalChat;
