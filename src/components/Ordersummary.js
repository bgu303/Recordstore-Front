import * as React from 'react';
import { useState } from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import '../styling/Ordersummary.css'

function Ordersummary({ customerInfo, cartTotal }) {
    const navigate = useNavigate();

    const returnFrontpage = () => {
        navigate("/records")
    }

    return (
        <>
            <div className="orderSummaryMainDiv">
                <h2>Tilauksen yhteenveto</h2>
                <p>Tilaajan nimi: <b>{customerInfo.name}</b></p>
                <p>Tilaajan puhelinnumero: <b>{customerInfo.phoneNumber}</b></p>
                <p>Tilaajan sähköposti: <b>{customerInfo.email}</b></p>
                <p>Tilaajan osoite: <b>{customerInfo.address}</b></p>
                <p>Tilaajan kaupunki: <b>{customerInfo.city}</b></p>
                <p>Tilaajan postinumero: <b>{customerInfo.zipCode}</b></p>
                <p>Tilaajan maksutapa: <b>{customerInfo.paymentOption}</b></p>
                <p>Tilauksen hinta yhteensä: <b>{cartTotal} euroa.</b></p>
                <p>Kiitos tilauksestasi. Sinuun ollaan henkilökohtaisesti yhteydessä.</p>
                <Button size="large" color="success" variant="contained" onClick={() => returnFrontpage()}>Palaa levylistaan</Button>
            </div>
        </>
    )
}

export default Ordersummary;