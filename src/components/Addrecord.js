import { useState, useEffect } from 'react';
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-material.css';
import { Button } from '@mui/material';
import TextField from '@mui/material/TextField';
import '../styling/Createuser.css';
import { AgGridReact } from 'ag-grid-react';
import { useNavigate } from "react-router-dom";

import { BASE_URL } from './Apiconstants';

function AddRecord({ loggedInUser }) {
    const navigate = useNavigate();
    const token = localStorage.getItem("jwtToken");
    const [newRecord, setNewRecord] = useState({
        artist: "",
        title: "",
        label: "",
        year: null,
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
                    year: newRecord.year,
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
                    year: null,
                    size: "",
                    lev: "",
                    kan: "",
                    price: null,
                    genre: "",
                    discogs: "",
                    sold: false
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
                    title: trimQuotes(columns[1]),
                    label: trimQuotes(columns[2]),
                    year: parseInt(columns[3]),
                    size: columns[4],
                    lev: columns[5],
                    kan: columns[6],
                    genre: columns[7],
                    price: parseFloat(columns[8]),
                    discogs: columns[9],
                    shelf_space: columns[10]
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
        { headerName: "Artisti", field: "artist", flex: 3 },
        { headerName: "Levyn nimi", field: "title", flex: 3 },
        { headerName: "Levy-yhtiö", field: "label", flex: 2 },
        { headerName: "Vuosi", field: "year", flex: 1 },
        { headerName: "Koko", field: "size", flex: 1 },
        { headerName: "Rec", field: "lev", flex: 1 },
        { headerName: "PS", field: "kan", flex: 1 },
        { headerName: "Genre", field: "genre", flex: 1 },
        { headerName: "Hinta", field: "price", flex: 1, cellStyle: { textAlign: "right" } },
        { headerName: "Discogs", field: "discogs", flex: 1, cellStyle: { textAlign: "right" } },
        { headerName: "Hyllypaikka", field: "shelf_space", flex: 1 }
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
                <div className="ag-theme-material" style={{ height: "750px", width: "95%", margin: "auto", fontSize: 11, fontWeight: "bold" }}>
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