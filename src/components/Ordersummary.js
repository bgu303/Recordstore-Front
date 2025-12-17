import { useState, useEffect } from 'react';
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

    const returnToChat = () => {
        navigate("/chat")
    }

    return (
        <>
            <div className="orderSummaryMainDiv">
                <h2>Tilauksen yhteenveto</h2>
                <p>Tilaajan nimi: <b>{customerInfo.name}</b></p>
                <p>Tilaajan puhelinnumero: <b>{customerInfo.phoneNumber}</b></p>
                <p>Tilaajan sähköposti: <b>{customerInfo.email}</b></p>
                {customerInfo.address && <p>Tilaajan osoite: <b>{customerInfo.address}</b></p>}
                <p>Tilauksen maksutapa: <b>{customerInfo.paymentOption}</b></p>
                <p>Tilauksen hinta yhteensä: <b>{cartTotal} euroa + mahdolliset toimituskustannukset.</b></p>
                <p>Kiitos tilauksestasi. Sinuun ollaan henkilökohtaisesti Chatin kautta yhteydessä.</p>
                <p>Kaikki tilaukseen liittyvät tiedot löytyvät <span style={{ color: "green", cursor: "pointer", fontWeight: "bold" }} onClick={() => returnFrontpage()}>TÄSTÄ.</span> (Puhelinnumero/Tilinumero + muut tilaustiedot)</p>
                <p>Tilauksestasi lähtee myös tieto Chattiin kaupankäynnin helpottamiseksi. Chattiin pääset <span style={{ color: "green", cursor: "pointer", fontWeight: "bold" }} onClick={() => returnToChat()}>TÄSTÄ.</span></p>
            </div>
        </>
    )
}

export default Ordersummary;