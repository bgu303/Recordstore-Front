import * as React from 'react';
import { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-material.css';
import { Button, TextField } from '@mui/material';
import '../styling/Createuser.css';

function Shoppingcart({ loggedInUser }) {
    const [shoppingcart, setShoppingcart] = useState([]);
    const [customerInfo, setCustomerInfo] = useState({
        name: "",
        phoneNumber: "",
        email: "",
        address: "",
        zipCode: "",
        city: ""
    });

    useEffect(() => {
        showShoppingcart();
    }, [loggedInUser.id]);

    const showShoppingcart = () => {
        fetch(`http://localhost:3001/records/shoppingcartitems/${loggedInUser.id}`)
            .then(response => response.json())
            .then(responseData => setShoppingcart(responseData))
    }

    const deleteFromShoppingcart = (data) => {
        if (window.confirm("Oletko varma että haluat poistaa levyn?")) {
            fetch(`http://localhost:3001/records/shoppingcartdelete/${data.id}`, { method: "DELETE" })
                .then(response => {
                    if (response.ok) {
                        showShoppingcart();
                    } else {
                        alert("Jotain meni vikaan.");
                    }
                })
        }
    }

    const sendOrder = async () => {
        if (customerInfo.name.trim() === "" || customerInfo.phoneNumber.trim() === "" || customerInfo.email.trim() === "" || customerInfo.address.trim() === "" || customerInfo.zipCode.trim() === "" || customerInfo.city.trim() === "") {
            return alert("Täytä kaikki tilaajan kentät.");
        }
        if (shoppingcart.length === 0) {
            return alert("Ostoskori on tyhjä. Lisää tuotteita ennen tilauksen lähettämistä.");
        }
        const confirmation = window.confirm("Lähetetäänkö ostoskori?");

        if (confirmation) {
            try {
                const response = await fetch("http://localhost:3001/records/sendcart", {
                    method: "POST",
                    headers: { "Content-type": "application/json" },
                    body: JSON.stringify({
                        shoppingcart,
                        customerInfo
                    })
                });

                if (!response.ok) {
                    return alert("Jokin meni vikaan");
                } else {
                    setCustomerInfo({
                        name: "",
                        phoneNumber: "",
                        email: "",
                        zipCode: "",
                        city: ""
                    });

                    fetch(`http://localhost:3001/records/shoppingcartdeleteall/${loggedInUser.id}`, { method: "DELETE" })
                        .then(response => {
                            if (response.ok) {
                                showShoppingcart();
                            } else {
                                alert("Jotain meni vikaan.");
                                console.log(response);
                            }
                        });
                    return alert("Ostoskori lähetetty");
                }
            } catch (error) {
                console.log(`Error in sending order: ${error}`);
            }
        } else {
            alert("Ostoskoria ei lähetetty.");
        }
    };


    const [columnDefinitions, setColumnDefinitions] = useState([
        { field: "artist", headerName: "Artisti", filter: true, suppressMovable: true, flex: 1 },
        { field: "title", headerName: "Levyn nimi", filter: true, suppressMovable: true, flex: 1 },
        { field: "size", headerName: "Koko", filter: true, suppressMovable: true, flex: 1 },
        { field: "price", headerName: "Hinta", filter: true, suppressMovable: true, flex: 1 },
        {
            cellRenderer: params => <Button size="small" color="error" onClick={() => deleteFromShoppingcart(params.data)}>Poista</Button>,
            flex: 1,
        },
    ]);

    return (
        <>
            <h2>Ostoskori</h2>
            <div className="ag-theme-material trainings" style={{ height: "500px", width: "95%", margin: "auto" }}>
                <AgGridReact
                    rowData={shoppingcart}
                    columnDefs={columnDefinitions}
                    pagination={true}
                    paginationPageSize={20}
                    domLayout="auto"
                />
            </div>
            <div className="mainDiv">
                <h3>Tilaajan Tiedot</h3>
                <TextField label="Koko nimi"
                    onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    value={customerInfo.name}
                />
                <TextField label="Puhelinnumero"
                    onChange={e => setCustomerInfo({ ...customerInfo, phoneNumber: e.target.value })}
                    value={customerInfo.phoneNumber}
                />
                <TextField label="Sähköposti"
                    onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    value={customerInfo.email}
                />
                <TextField label="Kotiosoite"
                    onChange={e => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    value={customerInfo.address}
                />
                <TextField label="Postinumero"
                    onChange={e => setCustomerInfo({ ...customerInfo, zipCode: e.target.value })}
                    value={customerInfo.zipCode}
                />
                <TextField label="Kaupunki"
                    onChange={e => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                    value={customerInfo.city}
                />
            </div>
            <div style={{ textAlign: "center" }}>
                <Button size="large" color="success" variant="contained" onClick={() => sendOrder()}>Lähetä</Button>
            </div>
        </>
    )
}

export default Shoppingcart;