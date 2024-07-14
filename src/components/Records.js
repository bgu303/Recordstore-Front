import * as React from 'react';
import { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-material.css';
import { Button } from '@mui/material';
import { BASE_URL, BASE_URL_CLOUD } from './Apiconstants';
import Sizefilter from './Sizefilter';

function Records({ isLoggedIn, loggedInUser, onModelChange, showShoppingcart }) {
    const [records, setRecords] = useState([]);
    const token = localStorage.getItem("jwtToken")

    const getRecords = () => {
        fetch(`${BASE_URL_CLOUD}/records`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Something went wrong");
                }
            })
            .then(responseData => {
                // Filter out sold records if the user is not an admin.
                if (localStorage.getItem("loggedInUserRole") !== "ADMIN") {
                    responseData = responseData.filter(record => record.sold === 0);
                }
                setRecords(responseData);
            })
            .catch(error => {
                console.log(error.message);
                setRecords([]);
            });
    }

    const handleDiscogsLink = (data) => {
        const discogsSubStr = data.substring(1);
        fetch(`https://api.discogs.com/releases/${discogsSubStr}`)
            .then(response => response.json())
            .then(responseData => window.open(responseData.uri))
    }

    const deleteRecord = (data) => {
        if (window.confirm("Oletko varma että haluat poistaa levyn?")) {
            fetch(`${BASE_URL_CLOUD}/records/${data.id}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
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
                showShoppingcart();
                alert("Koriin lisääminen onnistui!");
                return;
            }
        } catch (error) {
            console.log(`Error adding to cart: ${error}`);
        }
    }

    const changeStatus = (data) => {
        //If data.sold === 0, it means that the value is false, and the record hasnt been sold. If data.sold === 1, it means the value is true, and the record has been sold
        let soldStatus = data.sold;
        let recordId = data.id

        if (soldStatus === 0) {
            fetch(`${BASE_URL_CLOUD}/records/updatesoldstatustosold/${recordId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        getRecords();
                    } else {
                        console.error("Failed to update sold status");
                    }
                })
                .catch(error => {
                    console.error("Error updating sold status:", error);
                });
        }

        if (soldStatus === 1) {
            fetch(`${BASE_URL_CLOUD}/records/updatesoldstatustonotsold/${recordId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        getRecords();
                    } else {
                        console.error("Failed to update sold status");
                    }
                })
                .catch(error => {
                    console.error("Error updating sold status:", error);
                });
        }
    }

    useEffect(() => {
        getRecords();
    }, [isLoggedIn])

    const [columnDefinitions, setColumnDefinitions] = useState([
        { field: "artist", headerName: "Artisti", filter: true, suppressMovable: true, flex: 2 },
        { field: "title", headerName: "Levyn nimi", filter: true, suppressMovable: true, flex: 2 },
        { field: "label", headerName: "Levy-yhtiö", filter: true, suppressMovable: true, flex: 2 },
        { field: "size", headerName: "Koko", filter: Sizefilter, suppressMovable: true, flex: 1 },
        { field: "lev", headerName: "Rec", filter: true, suppressMovable: true, flex: 1 },
        { field: "kan", headerName: "PS", filter: true, suppressMovable: true, flex: 1 },
        { field: "price", headerName: "Hinta", filter: true, suppressMovable: true, cellStyle: { textAlign: "right" }, width: 100 },
        { field: "genre", headerName: "Genre", filter: true, suppressMovable: true, flex: 1 },
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
            flex: 1.5,
            suppressMovable: true,
            hide: !localStorage.getItem("isLoggedIn") || localStorage.getItem("loggedInUserRole") === "ADMIN"
        },
        {
            cellRenderer: params => <Button size="small" variant="contained" color="error" onClick={() => deleteRecord(params.data)}>Poista</Button>,
            flex: 1,
            suppressMovable: true,
            hide: localStorage.getItem("loggedInUserRole") !== "ADMIN"
        },
        {
            field: "sold", headerName: "Status", filter: true, suppressMovable: true, flex: 1,
            hide: localStorage.getItem("loggedInUserRole") !== "ADMIN",
            cellRenderer: params => {
                return params.value === 0 ? "Myytävänä" : "Myyty";
            }
        },
        {
            cellRenderer: params => <Button size="small" variant="contained" color="success" onClick={() => changeStatus(params.data)}>Status</Button>,
            flex: 1,
            suppressMovable: true,
            hide: localStorage.getItem("loggedInUserRole") !== "ADMIN"
        },
    ]);

    const finnishTranslations = {
        filterOoo: 'Hae...',
    };

    //This needs to be added in order to use custom filtering tools.
    const gridOptions = {
        reactiveCustomComponents: true
    }

    return (
        <>
            <h1 style={{ textAlign: "center" }}>Levykaupan levylista</h1>
            <div className="ag-theme-material trainings" style={{ height: "80vh", width: "95%", margin: "auto", fontSize: 11 }}>
                <AgGridReact
                    reactiveCustomComponents
                    rowData={records}
                    columnDefs={columnDefinitions}
                    localeText={finnishTranslations}
                    domLayout="auto"
                    getRowHeight={() => 35}
                    gridOptions={gridOptions}
                />
            </div>
        </>
    )
}

export default Records;
