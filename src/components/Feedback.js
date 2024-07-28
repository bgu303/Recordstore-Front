import { useState, useEffect } from "react";
import { TextField, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import '../styling/Feedback.css';

import { BASE_URL, BASE_URL_CLOUD } from './Apiconstants';

function SendFeedback({ loggedInUser }) {
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const token = localStorage.getItem("jwtToken");
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("isLoggedIn")) {
            navigate("/records");
        }
    }, [navigate]);

    const sendFeedbackMessage = async () => {
        if (feedbackMessage.trim().length <= 0) {
            return alert("Ei tyhjiä palautteita.");
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
            });
            if (!response.ok) {
                return alert("Jokin meni vikaan palautetta lähettäessä.");
            } else {
                setFeedbackMessage("");
            }
            return alert("Palaute lähetetty onnistuneesti.");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="feedbackContainer">
            <h1 className="feedbackHeader">Lähetä palautetta</h1>
            <h3 className="feedbackSubheader">Tällä sivulla voit lähettää kehitysehdotuksia, ilmoittaa bugeista tai muuten vaan lähettää palautetta.</h3>
            <div className="feedbackForm">
                <TextField
                    onChange={e => setFeedbackMessage(e.target.value)}
                    value={feedbackMessage}
                    multiline
                    rows={4}
                    className="feedbackTextfield"
                />
                <Button size="medium" variant="contained" color="success" onClick={sendFeedbackMessage}>Lähetä</Button>
            </div>
        </div>
    );
}

export default SendFeedback;
