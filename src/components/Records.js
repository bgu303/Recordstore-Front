import * as React from 'react';
import { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-material.css';
import { Button } from '@mui/material';
import { BASE_URL, BASE_URL_CLOUD} from './Apiconstants';

function Records({ isLoggedIn, loggedInUser }) {
    const [records, setRecords] = useState([]);

    const getRecords = () => {
        fetch(`${BASE_URL_CLOUD}/records`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Something went wrong");
                }
            })
            .then(responseData => setRecords(responseData))
            .catch(error => {
                console.log(error.message);
                setRecords([]);
            })
    }

    const handleDiscogsLink = (data) => {
        const discogsSubStr = data.substring(1);
        fetch(`https://api.discogs.com/releases/${discogsSubStr}`)
            .then(response => response.json())
            .then(responseData => window.open(responseData.uri))
    }

    const deleteRecord = (data) => {
        if (window.confirm("Oletko varma että haluat poistaa levyn?")) {
            fetch(`${BASE_URL_CLOUD}/records/${data.id}`, { method: "DELETE" })
                .then(response => {
                    if (response.ok) {
                        getRecords();
                    } else {
                        alert("Jotain meni vikaan.");
                    }
                })
        }
    }

    const addToCart = async (data) => {
        console.log(`UserId: ${loggedInUser.id} itemId: ${data.id}`);
        try {
            const response = await fetch(`${BASE_URL_CLOUD}/shoppingcart/addtocart`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    userId: loggedInUser.id,
                    recordId: data.id
                })
            })

            if (!response.ok) {
                if (response.status === 501) {
                    return alert("Levy on jo sinun tai toisen käyttäjän ostoskorissa");
                }
                return alert("Jokin meni vikaan lisätessä koriin");
            } else {
                return alert("Koriin lisääminen onnistui!");
            }
        } catch (error) {
            console.log(`Error adding to cart: ${error}`);
        }
    }

    useEffect(() => {
        getRecords();
    }, [isLoggedIn])

    const [columnDefinitions, setColumnDefinitions] = useState([
        { field: "artist", headerName: "Artisti", filter: true, suppressMovable: true, width: 240 },
        { field: "title", headerName: "Levyn nimi", filter: true, suppressMovable: true, width: 270 },
        { field: "label", headerName: "Levy-yhtiö", filter: true, suppressMovable: true, width: 200 },
        { field: "size", headerName: "Koko", filter: true, suppressMovable: true, width: 120 },
        { field: "lev", headerName: "Rec", filter: true, suppressMovable: true, width: 120 },
        { field: "kan", headerName: "PS", filter: true, suppressMovable: true, width: 120 },
        { field: "price", headerName: "Hinta", filter: true, suppressMovable: true, cellStyle: { textAlign: "right" }, width: 120 },
        { field: "genre", headerName: "Genre", filter: true, suppressMovable: true, width: 150 },
        {
            field: "discogs",
            headerName: "Discogs",
            filter: true,
            suppressMovable: true,
            width: 110,
            cellRenderer: params => (
                <div
                    style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                    onClick={() => handleDiscogsLink(params.data.discogs)}
                >
                    {params.data.discogs}
                </div>
            ),
        },
        {
            cellRenderer: params => <Button size="small" variant="contained" color="success" onClick={() => addToCart(params.data)}>Lisää Koriin</Button>,
            width: 160,
            suppressMovable: true,
            hide: !localStorage.getItem("isLoggedIn")
        },
        {
            cellRenderer: params => <Button size="small" variant="contained" color="error" onClick={() => deleteRecord(params.data)}>Poista</Button>,
            width: 130,
            suppressMovable: true,
            hide: localStorage.getItem("loggedInUserRole") !== "ADMIN"
        }
    ]);

    const finnishTranslations = {
        filterOoo: 'Hae...',
    };

    return (
        <>
            <h1 style={{ textAlign: "center" }}>Levykaupan levylista</h1>
            <div className="ag-theme-material trainings" style={{ height: "750px", width: "95%", margin: "auto", fontSize: 12 }}>
                <AgGridReact
                    rowData={records}
                    columnDefs={columnDefinitions}
                    localeText={finnishTranslations}
                    domLayout="auto"
                    getRowHeight={() => 35}
                />
            </div>
        </>
    )
}

export default Records;
