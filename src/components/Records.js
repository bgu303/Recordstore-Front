import * as React from 'react';
import { useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-material.css';
import { Button } from '@mui/material';

function Records() {

    const [records, setRecords] = useState([
        { artist: "Elvis", title: "Elvis Greatest Hits", label: "Elvis Music Label", size: "CD", lev: "EX", kan: "EX", price: "4", genre: "ROCK/POP", discogs: "r43433443"},
        { artist: "Beatles", title: "Beatles Greatest Hits", label: "Beatles Music Label", size: "LP", lev: "EX", kan: "EX", price: "20", genre: "ROCK/POP", discogs: "r333443"}
    ])

    const [columnDefinitions, setColumnDefinitions] = useState([
        { field: "artist", headerName: "Artisti", filter: true, suppressMovable: true, width: 150},
        { field: "title", headerName: "Levyn nimi", filter: true, suppressMovable: true},
        { field: "label", headerName: "Levy-yhtiö", filter: true, suppressMovable: true},
        { field: "size", headerName: "Koko", filter: true, suppressMovable: true, width: 150},
        { field: "lev", headerName: "Rec", filter: true, suppressMovable: true, width: 150},
        { field: "kan", headerName: "PS", filter: true, suppressMovable: true, width: 150},
        { field: "price", headerName: "Hinta", filter: true, suppressMovable: true, width: 150},
        { field: "genre", headerName: "Genre", filter: true, suppressMovable: true, width: 150},
        { field: "discogs", headerName: "Discogs", filter: true, suppressMovable: true, width: 170},
        {
            cellRenderer: params => <Button size="small" color="success" onClick={() => addToChart(params.data)}>Lisää Koriin</Button>
        },
        {
            cellRenderer: params => <Button size="small" color="error" onClick={() => deleteRecord(params.data)}>Poista</Button>
        }
    ])

    const deleteRecord = (data) => {
        console.log(`deleting data: ${data}`)
    }

    const addToChart = (data) => {
        console.log(`adding to chart: ${data}`)
    }

    return (
        <>
            <h1 style={{textAlign: "center"}}>Levykaupan levylista</h1>
            <div className="ag-theme-material trainings" style={{ height: '2000px', width: "95%", margin: "auto" }}>
                <AgGridReact rowData={records} columnDefs={columnDefinitions} />
            </div>
        </>
    )
}

export default Records
