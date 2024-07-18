import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import '../styling/Ordersummary.css'

function Ordersummary({ loggedInUser, customerInfo, cartTotal }) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("isLoggedIn") || customerInfo.name === "") {
            navigate("/records")
        }
    }, [])

    const returnFrontpage = () => {
        navigate("/ownorders")
    }

    return (
        <>
            <div className="orderSummaryMainDiv">
                <h2>Tilauksen yhteenveto</h2>
                <p>Tilaajan nimi: <b>{customerInfo.name}</b></p>
                <p>Tilaajan puhelinnumero: <b>{customerInfo.phoneNumber}</b></p>
                <p>Tilaajan sähköposti: <b>{customerInfo.email}</b></p>
                <p>Tilaajan osoite: <b>{customerInfo.address}</b></p>
                <p>Tilauksen maksutapa: <b>{customerInfo.paymentOption}</b></p>
                <p>Tilauksen hinta yhteensä: <b>{cartTotal} euroa.</b></p>
                <p>Kiitos tilauksestasi. Sinuun ollaan henkilökohtaisesti yhteydessä.</p>
                <p>Pääset näkemään omat tilauksesi <span style={{ color: "green", cursor: "pointer", fontWeight: "bold" }} onClick={() => returnFrontpage()}>TÄSTÄ</span></p>
            </div>
        </>
    )
}

export default Ordersummary;