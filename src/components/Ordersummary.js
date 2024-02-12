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
                <p>Tilaajan nimi: {customerInfo.name}</p>
                <p>Tilaajan puhelinnumero: {customerInfo.phoneNumber}</p>
                <p>Tilaajan sähköposti: {customerInfo.email}</p>
                <p>Tilaajan osoite: {customerInfo.address}</p>
                <p>Tilaajan kaupunki: {customerInfo.city}</p>
                <p>Tilaajan postinumero: {customerInfo.zipCode}</p>
                <p>Tilaajan maksutapa: {customerInfo.paymentOption}</p>
                <p>Tilauksen hinta yhteensä: {cartTotal} euroa.</p>
                <Button size="large" color="success" variant="contained" onClick={() => returnFrontpage()}>Palaa levylistaan</Button>
            </div>
        </>
    )
}

export default Ordersummary;