import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styling/Ordersummary.css'

function Ordersummary({ loggedInUser, customerInfo, cartTotal }) {
    const navigate = useNavigate();
    const [orderId, setOrderId] = useState(null);
    const [orderCode, setOrderCode] = useState(null);
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    useEffect(() => {
        // Get order info from localStorage
        const lastOrderId = localStorage.getItem('lastOrderId');
        const lastOrderCode = localStorage.getItem('lastOrderCode');
        
        // Check if we have valid order info and customer info
        if (!lastOrderId || customerInfo.name === "") {
            navigate("/records")
            return;
        }
        
        setOrderId(lastOrderId);
        setOrderCode(lastOrderCode);
    }, [])

    const returnToOwnOrders = () => {
        navigate("/ownorders")
    }

    const returnToRecords = () => {
        navigate("/records")
    }

    const returnToChat = () => {
        navigate("/chat")
    }

    const baseTotal = Number(cartTotal) || 0;
    const shippingFee = customerInfo.shippingOption === "Matkahuolto" ? 7.50 : 0;
    const totalWithShipping = (baseTotal + shippingFee).toFixed(2).replace('.', ',');

    return (
        <>
            <div className="orderSummaryMainDiv">
                <h2>Tilauksen yhteenveto</h2>
                <p>Tilaajan nimi: <b>{customerInfo.name}</b></p>
                <p>Tilaajan puhelinnumero: <b>{customerInfo.phoneNumber}</b></p>
                <p>Tilaajan sähköposti: <b>{customerInfo.email}</b></p>
                {customerInfo.address && <p>Tilaajan osoite/Matkahuollon toimipiste: <b>{customerInfo.address}</b></p>}
                <p>Tilauksen maksutapa: <b>{customerInfo.paymentOption}</b></p>
                <p>Tilauksen toimitustapa: <b>{customerInfo.shippingOption}</b></p>
                <p>Tilauksen hinta yhteensä: <b>{totalWithShipping} euroa.</b></p>
                {customerInfo.paymentOption === "Tilisiirto" && (
                    <>
                        <p>Maksu tilille: <b>XXXXXXXX</b></p>
                        <p><i><b style={{ textDecoration: "underline"}}>Otathan tilinumeron talteen maksua varten!</b></i></p>
                    </>
                )}
                {customerInfo.paymentOption === "MobilePay" && (
                    <>
                        <p>Maksu numeroon: <b>0505736934</b></p>
                        <p><i><b style={{ textDecoration: "underline"}}>Otathan puhelinnumeron talteen maksua varten!</b></i></p>
                    </>
                )}
                <p>Kiitos tilauksestasi!</p>
                
                {isLoggedIn ? (
                    <>
                        <p>Sinuun ollaan henkilökohtaisesti Chatin kautta yhteydessä.</p>
                        <p>Kaikki tilaukseen liittyvät tiedot löytyvät <span style={{ color: "green", cursor: "pointer", fontWeight: "bold" }} onClick={() => returnToOwnOrders()}>TÄSTÄ.</span> (Puhelinnumero/Tilinumero + muut tilaustiedot)</p>
                        <p>Tilauksestasi lähtee myös tieto Chattiin kaupankäynnin helpottamiseksi. Chattiin pääset <span style={{ color: "green", cursor: "pointer", fontWeight: "bold" }} onClick={() => returnToChat()}>TÄSTÄ.</span></p>
                    </>
                ) : (
                    <>
                        <p>Tulemme pitämään yhteyttä sähköpostitse tilauksen käsittelyn edetessä.</p>
                        <p>PoppiMikkoon saa yhteyttä sähköpostiosoitteesta: <b>mives44@gmail.com</b></p>
                        <p>Kiitos! <span style={{ color: "green", cursor: "pointer", fontWeight: "bold" }} onClick={() => returnToRecords()}>Takaisin levyihin</span></p>
                    </>
                )}
            </div>
        </>
    )
}

export default Ordersummary;