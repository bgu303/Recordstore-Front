import { Button, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-material.css';
import '../styling/Frontpagetool.css'
import { useNavigate } from 'react-router-dom';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';

import { BASE_URL } from "./Apiconstants";

function FrontPageTool() {
    const [notification, setNotification] = useState("");
    const [notifications, setNotifications] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const token = localStorage.getItem("jwtToken");
    const [playlist, setPlaylist] = useState({
        url: "",
        playlistName: "",
        playlistSource: ""
    });

    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem("loggedInUserRole") !== "ADMIN") {
            navigate("/records");
        }
    }, [])

    const getNotifications = () => {
        fetch(`${BASE_URL}/notifications/`)
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

    const addNotification = async () => {
        if (notification.trim().length <= 0) {
            return alert("Ei tyhjiä ilmoituksia.");
        }

        try {
            const response = await fetch(`${BASE_URL}/notifications/addnotification`, {
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

    const deleteNotification = (data) => {
        const notificationId = data.id;

        fetch(`${BASE_URL}/notifications/notificationdelete/${notificationId}`, {
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

    const getPlaylists = () => {
        fetch(`${BASE_URL}/playlists/`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    console.log("Failed to fetch notifications.")
                }
            })
            .then(responseData => {
                setPlaylists(responseData)
            })
    }

    const addPlaylist = async () => {
        if (playlist.url.trim() === "" || playlist.playlistName.trim() === "" || playlist.playlistSource.trim() === "") {
            return alert("Täytä kaikki soittolistaa koskettavat kentät.")
        }
        try {
            const response = await fetch(`${BASE_URL}/playlists/addplaylist`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: playlist.url,
                    playlistName: playlist.playlistName,
                    playlistSource: playlist.playlistSource
                })
            })
            if (!response.ok) {
                return alert("Jokin meni vikaa ilmoitusta lisätessä.");
            } else {
                setPlaylist({
                    url: "",
                    playlistName: "",
                    playlistSource: ""
                });
                getPlaylists();
            }
        } catch (error) {
            console.log(error);
        }
    }

    const deletePlaylist = (data) => {
        const playlistId = data.id;

        fetch(`${BASE_URL}/playlists/playlistdelete/${playlistId}`, {
            method: "DELETE",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.ok) {
                    getPlaylists();
                } else {
                    alert("Jokin meni vikaan.")
                }
            })
    }

    useEffect(() => {
        getNotifications();
        getPlaylists();
    }, [])


    const columnDefinitions = [
        { headerName: "Ilmoitus", field: "notification_text", width: 500 },
        {
            cellRenderer: params => <Button size="small" variant="contained" color="error" onClick={() => deleteNotification(params.data)}>Poista</Button>,
            suppressMovable: true,
            hide: localStorage.getItem("loggedInUserRole") !== "ADMIN"
        },
    ];

    const columnDefinitionsPlaylists = [
        { headerName: "Soittolistan nimi", field: "playlist_name", width: 250 },
        { headerName: "Soittolistan URL", field: "playlist_url", width: 500 },
        { headerName: "Soittolistan lähde", field: "playlist_source", width: 150 },
        {
            cellRenderer: params => <Button size="small" variant="contained" color="error" onClick={() => deletePlaylist(params.data)}>Poista</Button>,
            suppressMovable: true,
            hide: localStorage.getItem("loggedInUserRole") !== "ADMIN"
        },
    ];

    const handlePlaylistSource = (e) => {
        setPlaylist({ ...playlist, playlistSource: e.target.value });
    }

    return (
        <>
            <div className="container">
                <h1 className="title">Etusivutyökalu</h1>
                <h3 className="title">Lisää uusi ilmoitus</h3>
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
            <div className="ag-theme-material trainings" style={{ height: 260, width: 700, margin: "auto", fontWeight: "bold" }}>
                <AgGridReact
                    rowData={notifications}
                    columnDefs={columnDefinitions}
                />
            </div>
            <div style={{ height: 2, backgroundColor: "#2e2e30", margin: "auto", width: "90%", marginBottom: 40 }}></div>
            <div className="container">
                <h3 className="title">Lisää uusi soittolista</h3>
                <TextField
                    onChange={e => setPlaylist({ ...playlist, playlistName: e.target.value })}
                    value={playlist.playlistName}
                    placeholder="Soittolistan nimi"
                    className="textField"
                />
                <div style={{ marginTop: 10, marginBottom: 15 }}>
                    <TextField
                        onChange={e => setPlaylist({ ...playlist, url: e.target.value })}
                        value={playlist.url}
                        placeholder="Soittolistan URL"
                        className="textField"
                    />
                </div>
                <FormControl>
                    <FormLabel>Soittolista</FormLabel>
                    <RadioGroup
                        aria-label="playlistSource"
                        name="playlistSource"
                        value={playlist.playlistSource}
                        onChange={handlePlaylistSource}
                    >
                        <FormControlLabel
                            value="Spotify"
                            control={<Radio />}
                            label="Spotify"
                        />
                        <FormControlLabel
                            value="Youtube"
                            control={<Radio />}
                            label="Youtube"
                        />
                    </RadioGroup>
                </FormControl>
                <div className="buttonDiv">
                    <Button
                        color="success"
                        variant="contained"
                        onClick={addPlaylist}
                    >
                        Lisää soittolista etusivulle
                    </Button>
                </div>
                <h3>Tämänhetkiset soittolistat:</h3>
            </div>
            <div className="ag-theme-material trainings" style={{ height: 400, width: 1100, margin: "auto", fontWeight: "bold" }}>
                <AgGridReact
                    rowData={playlists}
                    columnDefs={columnDefinitionsPlaylists}
                />
            </div>

        </>
    );
}

export default FrontPageTool;