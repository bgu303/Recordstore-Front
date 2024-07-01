import { useState } from "react";
import { TextField, Button } from "@mui/material";
import { BASE_URL, BASE_URL_CLOUD } from './Apiconstants';

function SendFeedback({ loggedInUser }) {
    const [feedbackMessage, setFeetbackMessage] = useState("");
    const token = localStorage.getItem("jwtToken");

    const sendFeedbackMessage = async () => {
        if (feedbackMessage.trim().length <= 0) {
            return alert("Ei tyhjiä palautteita.")
        }
        try {
            const response = await fetch(`${BASE_URL}/feedback/sendfeedback`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loggedInUserId: loggedInUser.id,
                    loggedInUserEmail: loggedInUser.email,
                    feedbackMessage: feedbackMessage
                })
            })
            if (!response.ok) {
                return alert("Jokin meni vikaan palautetta lähettäessä.");
            } else {
                setFeetbackMessage("")
            }
            return alert("Palaute lähetetty onnistuneesti.")
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            <div style={{ textAlign: "center" }}>
                <h1>Lähetä palautetta</h1>
                <h3>Tällä sivulla voit lähettää kehitysehdotuksia, ilmoittaa bugeista tai muuten vaan lähettää palautetta.</h3>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                    <TextField
                        onChange={e => setFeetbackMessage(e.target.value)}
                        value={feedbackMessage}
                        multiline
                        rows={4}
                        style={{ width: "500px" }}
                    />
                    <Button size="medium" variant="contained" color="success" onClick={() => sendFeedbackMessage()}>Lähetä</Button>
                </div>
            </div>
        </>
    )

}

export default SendFeedback;