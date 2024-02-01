import * as React from 'react';
import { useState } from 'react';
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-material.css';
import { Button } from '@mui/material';
import TextField from '@mui/material/TextField';
import '../styling/Createuser.css';
import { BASE_URL } from './Apiconstants';

function AddRecord() {
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
    })

    const addNewRecord = async () => {
        try {
            const response = await fetch(`${BASE_URL}/records/addnewrecord`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    artist: newRecord.artist,
                    title: newRecord.title,
                    label: newRecord.label,
                    size:newRecord.size,
                    lev: newRecord.lev,
                    kan: newRecord.kan,
                    price: newRecord.price,
                    genre: newRecord.genre,
                    discogs: newRecord.discogs,
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

    return (
        <>
        <div className="mainDiv">
            <h3>Lisää levy</h3>
            <TextField label="Artisti"
            onChange={e => setNewRecord({...newRecord, artist: e.target.value})}
            value={newRecord.artist}
            />
            <TextField label="Levyn nimi"
            onChange={e => setNewRecord({...newRecord, title: e.target.value})}
            value={newRecord.title}
            />
            <TextField label="Levy-yhtiö"
            onChange={e => setNewRecord({...newRecord, label: e.target.value})}
            value={newRecord.label}
            />
            <TextField label="Koko"
            onChange={e => setNewRecord({...newRecord, size: e.target.value})}
            value={newRecord.size}
            />
            <TextField label="Lev"
            onChange={e => setNewRecord({...newRecord, lev: e.target.value})}
            value={newRecord.lev}
            />
            <TextField label="Kan"
            onChange={e => setNewRecord({...newRecord, kan: e.target.value})}
            value={newRecord.kan}
            />
            <TextField label="Hinta"
            onChange={e => setNewRecord({...newRecord, price: e.target.value})}
            value={newRecord.price}
            />
            <TextField label="Genre"
            onChange={e => setNewRecord({...newRecord, genre: e.target.value})}
            value={newRecord.genre}
            />
            <TextField label="discogs"
            onChange={e => setNewRecord({...newRecord, discogs: e.target.value})}
            value={newRecord.discogs}
            />
            <Button onClick={() => addNewRecord()}>Lisää Levy</Button>
        </div>
        </>
    )
}

export default AddRecord;