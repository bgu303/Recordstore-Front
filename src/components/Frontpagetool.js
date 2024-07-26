import { Button, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-material.css';
import '../styling/Frontpagetool.css'

import { BASE_URL, BASE_URL_CLOUD } from "./Apiconstants";

function FrontPageTool() {
    const [notification, setNotification] = useState("");
    const [notifications, setNotifications] = useState([]);
    const token = localStorage.getItem("jwtToken");

    const addNotification = async () => {
        if (notification.trim().length <= 0) {
            return alert("Ei tyhjiä ilmoituksia.");
        }

        try {
            const response = await fetch(`${BASE_URL_CLOUD}/notifications/addnotification`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    notification: notification
                })
            })
            if (!response.ok) {
                return alert("Jokin meni vikaa ilmoitusta lisätessä.");
            } else {
                setNotification("");
                getNotifications();
            }
        } catch (error) {
            console.log(error);
        }
    }

    const getNotifications = () => {
        fetch(`${BASE_URL_CLOUD}/notifications/`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    console.log("Failed to fetch notifications.")
                }
            })
            .then(responseData => {
                setNotifications(responseData)
            })
    }

    const deleteNotification = (data) => {
        const notificationId = data.id;

        fetch(`${BASE_URL_CLOUD}/notifications/notificationdelete/${notificationId}`, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.ok) {
                    getNotifications();
                } else {
                    alert("Jokin meni vikaan.")
                }
            })
    }

    useEffect(() => {
        getNotifications();
    }, [])

    const columnDefinitions = [
        { headerName: "Ilmoitus", field: "notification_text", width: 500 },
        {
            cellRenderer: params => <Button size="small" variant="contained" color="error" onClick={() => deleteNotification(params.data)}>Poista</Button>,
            suppressMovable: true,
            hide: localStorage.getItem("loggedInUserRole") !== "ADMIN"
        },
    ];

    return (
        <>
            <div className="container">
                <h2 className="title">Etusivutyökalu</h2>
                <h4 className="title">Lisää uusi ilmoitus</h4>
                <TextField
                    onChange={e => setNotification(e.target.value)}
                    value={notification}
                    placeholder="Lisää uusi ilmoitus"
                    multiline
                    rows={4}
                    className="textField"
                />
                <div className="buttonDiv">
                    <Button
                        color="success"
                        variant="contained"
                        onClick={addNotification}
                    >
                        Lisää ilmoitus etusivulle
                    </Button>
                </div>
                <h3>Tämänhetkiset ilmoitukset:</h3>
            </div>
            <div className="ag-theme-material trainings" style={{ height: 400, width: 900, margin: "auto" }}>
                <AgGridReact
                    rowData={notifications}
                    columnDefs={columnDefinitions}
                />
            </div>
        </>
    );
}

export default FrontPageTool;