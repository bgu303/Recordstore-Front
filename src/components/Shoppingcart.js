import * as React from 'react';
import { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-material.css';
import { Button, TextField } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import { useNavigate } from "react-router-dom";
import '../styling/Createuser.css';
import { BASE_URL } from './Apiconstants';

function Shoppingcart({ loggedInUser, customerInfo, setCustomerInfo, cartTotal, setCartTotal }) {
    const [shoppingcart, setShoppingcart] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem('jwtToken');

    useEffect(() => {
        showShoppingcart();
    }, [loggedInUser.id]);

    useEffect(() => {
        setCustomerInfo({
            name: "",
            phoneNumber: "",
            email: "",
            address: "",
            zipCode: "",
            city: ""
        });
    }, [])


    useEffect(() => {
        calculateTotalAmount();
    }, [shoppingcart]);

    const calculateTotalAmount = () => {
        let total = 0;
        shoppingcart.forEach(item => {
            total += item.price;
        });
        setCartTotal(total);
    };

    const handlePaymentOption = (e) => {
        setCustomerInfo({ ...customerInfo, paymentOption: e.target.value });
    }

    const showShoppingcart = () => {
        fetch(`${BASE_URL}/shoppingcart/shoppingcartitems/${loggedInUser.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    navigate("/records");
                }
            })
            .then(responseData => setShoppingcart(responseData))
    }

    const deleteFromShoppingcart = (data) => {
        if (window.confirm("Oletko varma että haluat poistaa levyn?")) {
            if (!token) {
                return alert("Jokin meni vikaan");
            }

            fetch(`${BASE_URL}/shoppingcart/shoppingcartdelete/${data.id}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        showShoppingcart();
                    } else {
                        alert("Jotain meni vikaan.");
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert("Jotain meni vikaan.");
                });
        }
    }


    const sendOrder = async () => {
        if (window.confirm("Lähetetäänkö ostoskori?")) {
            if (customerInfo.name.trim() === "" || customerInfo.phoneNumber.trim() === "" || customerInfo.email.trim() === "" || customerInfo.address.trim() === "" || customerInfo.zipCode.trim() === "" || customerInfo.city.trim() === "") {
                return alert("Täytä kaikki tilaajan kentät.");
            }
            if (shoppingcart.length === 0) {
                return alert("Ostoskori on tyhjä. Lisää tuotteita ennen tilauksen lähettämistä.");
            }
            try {
                const response = await fetch(`${BASE_URL}/shoppingcart/sendcart`, {
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
                    fetch(`${BASE_URL}/shoppingcart/shoppingcartdeleteall/${loggedInUser.id}`, { method: "DELETE" })
                        .then(response => {
                            if (response.ok) {
                                showShoppingcart();
                            } else {
                                alert("Jotain meni vikaan.");
                                console.log(response);
                            }
                        });
                    navigate("/ordersummary");
                    return alert("Ostoskori lähetetty, Sinuun ollaan yhteydessä.");
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
            <h2 style={{ textAlign: "center" }}>Ostoskori</h2>
            <div className="ag-theme-material trainings" style={{ height: "500px", width: "95%", margin: "auto" }}>
                <AgGridReact
                    rowData={shoppingcart}
                    columnDefs={columnDefinitions}
                    pagination={true}
                    paginationPageSize={20}
                    domLayout="auto"
                />
            </div>
            <h3 style={{ marginLeft: "20px" }}>Yhteensä: {cartTotal} euroa.</h3>
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
                <div>
                    <FormControl>
                        <FormLabel>Maksutapa</FormLabel>
                        <RadioGroup
                            aria-label="paymentOption"
                            name="paymentOption"
                            value={customerInfo.paymentOption}
                            onChange={handlePaymentOption}
                        >
                            <FormControlLabel
                                value="Käteinen"
                                control={<Radio />}
                                label="Käteinen"
                            />
                            <FormControlLabel
                                value="Mobilepay"
                                control={<Radio />}
                                label="Mobilepay"
                            />
                            <FormControlLabel
                                value="Tilisiirto"
                                control={<Radio />}
                                label="Tilisiirto"
                            />
                        </RadioGroup>
                    </FormControl>
                </div>
            </div>
            <div style={{ textAlign: "center" }}>
                <Button size="large" color="success" variant="contained" onClick={() => sendOrder()}>Lähetä</Button>
            </div>
        </>
    )
}

export default Shoppingcart;