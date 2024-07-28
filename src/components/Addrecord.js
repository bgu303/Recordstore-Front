import * as React from 'react';
import { useState, useEffect } from 'react';
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-material.css';
import { Button } from '@mui/material';
import TextField from '@mui/material/TextField';
import '../styling/Createuser.css';
import { AgGridReact } from 'ag-grid-react';
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
    });
    const [newRecords, setNewRecords] = useState([]);
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
                    size: columns[1],
                    label: trimQuotes(columns[2]),
                    title: trimQuotes(columns[3]),
                    kan: columns[4],
                    lev: columns[5],
                    price: parseFloat(columns[6]),
                    discogs: columns[7],
                    genre: columns[8],
                };
            })
            //Filters rows that dont have artist, so empty row at the end of the file.
            .filter(row => row.artist);
        setNewRecords(parsedData);
    };

    const sendDataToServer = async () => {
        if (newRecords.length === 0) {
            return alert("Lisää tiedosto ja paina Esikatsele ennen levyjen lataamista serverille.");
        }
        try {
            const response = await fetch(`${BASE_URL}/records/addrecords`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ records: newRecords })
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

    const columns = [
        { headerName: "Artisti", field: "artist", width: 240 },
        { headerName: "Levyn nimi", field: "title" },
        { headerName: "Levy-yhtiö", field: "label" },
        { headerName: "Koko", field: "size" },
        { headerName: "Rec", field: "lev", width: 110 },
        { headerName: "PS", field: "kan", width: 110 },
        { headerName: "Hinta", field: "price" },
        { headerName: "Discogs", field: "discogs" },
        { headerName: "Genre", field: "genre" }
    ];

    return (
        <>
            <div style={{ textAlign: "center" }}>
                <h3>Lisää levyjä</h3>
                <div>
                    <input type="file" accept=".txt,.csv" onChange={handleFileChange} />
                    <Button color="success" variant="contained" onClick={() => handleFileUpload()}>Esikatsele</Button>
                    <Button color="success" variant="contained" onClick={() => sendDataToServer()}>Lataa Levyt</Button>
                </div>
                <div className="ag-theme-material" style={{ height: "750px", width: "95%", margin: "auto", fontSize: 11 }}>
                    <AgGridReact
                        rowData={newRecords}
                        columnDefs={columns}
                    />
                </div>
            </div>
        </>
    )
}

export default AddRecord;