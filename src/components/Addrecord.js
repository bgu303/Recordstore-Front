import * as React from 'react';
import { useState, useEffect } from 'react';
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-material.css';
import { Button } from '@mui/material';
import TextField from '@mui/material/TextField';
import '../styling/Createuser.css';
import { useNavigate } from "react-router-dom";
import { BASE_URL, BASE_URL_CLOUD } from './Apiconstants';

function AddRecord({ loggedInUser }) {
    const navigate = useNavigate();
    const token = localStorage.getItem("jwtToken");
    const [newRecord, setNewRecord] = useState({
        artist: "",
        title: "",
        label: "",
        size: "",
        lev: "",
        kan: "",
        price: null,
        genre: "",
        discogs: "",
        sold: false
    })
    const [file, setFile] = useState(null);

    useEffect(() => {
        if (!localStorage.getItem("isLoggedIn") || localStorage.getItem("loggedInUserRole") !== "ADMIN") {
            navigate("/records")
        }
    }, [])

    const addNewRecord = async () => {
        try {
            const response = await fetch(`${BASE_URL}/records/addnewrecord`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    artist: newRecord.artist,
                    title: newRecord.title,
                    label: newRecord.label,
                    size: newRecord.size,
                    lev: newRecord.lev,
                    kan: newRecord.kan,
                    price: newRecord.price,
                    genre: newRecord.genre,
                    discogs: newRecord.discogs,
                    sold: false
                })
            })
            if (!response.ok) {
                return alert("Jokin meni vikaan lisätessä levyä.");
            } else {
                setNewRecord({
                    artist: "",
                    title: "",
                    label: "",
                    size: "",
                    lev: "",
                    kan: "",
                    price: "",
                    genre: "",
                    discogs: "",
                });
                return alert("Levy lisätty onnistuneesti.");
            }
        } catch (error) {
            console.log(`Error in adding record: ${error}`);
        }
    }

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
    }

    const handleFileUpload = () => {
        if (!file) {
            return alert("Lisää tiedosto");
        }
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                parseData(text);
            }
            reader.readAsText(file);
        }
    }

    const parseData = (data) => {
        // Normalize the terms 12", 7", and 10" and remove unnecessary quotation marks
        const cleanedData = data.replace(/"12""/g, '12"')
                                .replace(/"7""/g, '7"')
                                .replace(/"10""/g, '10"')
                                .replace(/""/g, '"');
    
        // Split rows
        const rows = cleanedData.split("\n");
    
        // Function to trim quotation marks from the start and end of a string
        const trimQuotes = (str) => str ? str.replace(/^"|"$/g, '') : str;
    
        const parsedData = rows
            .map(row => {
                const columns = row.split(";");
                return {
                    artist: columns[0],
                    size: columns[1],  // Preserving quotation marks for size
                    label: trimQuotes(columns[2]),
                    title: trimQuotes(columns[3]),
                    kan: columns[4],
                    lev: columns[5],
                    price: parseFloat(columns[6]),
                    discogs: columns[7],
                    genre: columns[8],
                };
            })
            .filter(row => row.artist && row.size && row.label && row.title && row.kan && row.lev && !isNaN(row.price) && row.discogs && row.genre);
    
        console.log(parsedData);
        sendDataToServer(parsedData);
    };

    const sendDataToServer = async (parsedData) => {
        try {
            const response = await fetch(`${BASE_URL}/records/addrecords`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ records: parsedData })
            })
            if (!response.ok) {
                return alert("Jokin meni vikaan lisätessä levyjä.");
            } else {
                setFile(null)
                return alert("Levyt lisätty onnistuneesti.");
            }
        } catch (error) {
            console.log(`Error uploading data: ${error}`);
            alert("Error uploading data");
        }
    }

    return (
        <>
            <div className="mainDiv">
                <h3>Lisää levy</h3>
                <TextField label="Artisti"
                    onChange={e => setNewRecord({ ...newRecord, artist: e.target.value })}
                    value={newRecord.artist}
                />
                <TextField label="Levyn nimi"
                    onChange={e => setNewRecord({ ...newRecord, title: e.target.value })}
                    value={newRecord.title}
                />
                <TextField label="Levy-yhtiö"
                    onChange={e => setNewRecord({ ...newRecord, label: e.target.value })}
                    value={newRecord.label}
                />
                <TextField label="Koko"
                    onChange={e => setNewRecord({ ...newRecord, size: e.target.value })}
                    value={newRecord.size}
                />
                <TextField label="Lev"
                    onChange={e => setNewRecord({ ...newRecord, lev: e.target.value })}
                    value={newRecord.lev}
                />
                <TextField label="Kan"
                    onChange={e => setNewRecord({ ...newRecord, kan: e.target.value })}
                    value={newRecord.kan}
                />
                <TextField label="Hinta"
                    onChange={e => setNewRecord({ ...newRecord, price: e.target.value })}
                    value={newRecord.price}
                />
                <TextField label="Genre"
                    onChange={e => setNewRecord({ ...newRecord, genre: e.target.value })}
                    value={newRecord.genre}
                />
                <TextField label="discogs"
                    onChange={e => setNewRecord({ ...newRecord, discogs: e.target.value })}
                    value={newRecord.discogs}
                />
                <Button color="success" variant="contained" onClick={() => addNewRecord()}>Lisää Levy</Button>
                <div>
                    <h3>Lataa enemmän levyjä kerralla</h3>
                    <input type="file" accept=".txt,.csv" onChange={handleFileChange} />
                    <Button color="success" variant="contained" onClick={() => handleFileUpload()}>Lataa Levyt</Button>
                </div>
            </div>
        </>
    )
}

export default AddRecord;