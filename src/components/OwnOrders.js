import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styling/Ownorderlist.css'

import { BASE_URL } from "./Apiconstants";

function OwnOrders({ loggedInUser }) {
    const [orderData, setOrderData] = useState([]);
    const navigate = useNavigate();
    const steps = ["Vastaanotettu", "Käsittelyssä", "Toimitettu"];

    useEffect(() => {
        if (!localStorage.getItem("isLoggedIn")) {
            navigate("/records")
        }
    }, [])

    useEffect(() => {
        if (loggedInUser && loggedInUser.id) {
            getOrders();
        }
    }, [loggedInUser]);

    const getOrders = () => {
        fetch(`${BASE_URL}/orders/getorderdatabyid/${loggedInUser.id}`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    console.log("Something went wrong")
                }
            })
            .then(responseData => {
                // Group orders by their IDs
                const groupedOrders = groupBy(responseData, 'id');
                setOrderData(groupedOrders);
            })
            .catch(error => {
                console.log(error.message);
            });
    }

    function groupBy(array, key) {
        return array.reduce((result, currentValue) => {
            (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
            return result;
        }, {});
    }

    const formattedDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based.
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}.${month}.${year}. Kello ${hours}:${minutes}`;
    };

    function getTotalPrice(order) {
        let totalPrice = 0;
        order.forEach(item => {
            totalPrice += item.price;
        });
        return totalPrice;
    }

    return (
        <>
            <div className="mainDivOwnOrders">
                <h2>Omat Tilaukseni</h2>
                {Object.keys(orderData).length === 0 ? (
                    <h4>Ei aktiivisia tilauksia.</h4>
                ) : (
                    Object.entries(orderData).reverse().map(([orderId, order]) => (
                        <div key={orderId} className="orderContainer">
                            <h2>Tilauksen ID: <span style={{ color: "#2155ff" }}>{orderId}</span></h2>
                            <h3>Tilaus lähetetty: {formattedDate(order[0].order_date)}</h3>
                            {order.length > 0 && (
                                <>
                                    <p><b>Tilaajan Nimi:</b> {order[0].customer_name}</p>
                                    <p><b>Sähköposti:</b> {order[0].customer_email}</p>
                                    <p><b>Puhelinnumero:</b> {order[0].customer_phone}</p>
                                    <p><b>Maksutapa:</b> {order[0].customer_paymentoption}</p>
                                    <p><b>Toimitustapa:</b> {order[0].customer_shippingoption}</p>
                                    {order[0].customer_address && (
                                        <p><b>Osoite:</b> {order[0].customer_address}</p>
                                    )}
                                </>
                            )}
                            <hr className="separator" />
                            <ul>
                                <h3 style={{ textAlign: "center" }}>Tuotteet</h3>
                                {order.map(item => (
                                    <li style={{ marginBottom: "10px", lineHeight: "1.5rem" }} key={item.record_id}>
                                        <b>Artisti/Bändi:</b> {item.artist}<br />
                                        <b>Levyn nimi:</b> {item.title}<br />
                                        <b>Levy-yhtiö:</b> {item.label}<br />
                                        <b>Koko:</b> {item.size}<br />
                                        <b>Hinta:</b> {item.price}€<br />
                                    </li>
                                ))}
                            </ul>
                            <p>
                                Hinta yhteensä: {getTotalPrice(order)}€
                                {order[0].customer_shippingoption === "Matkahuolto" && (
                                    <>
                                        <b> + 7,50€ postitusmaksu</b>
                                        <br />
                                        Kokonaishinta: <b>{(getTotalPrice(order) + 7.50).toFixed(2)}€</b>
                                    </>
                                )}
                            </p>
                            {order[0].customer_paymentoption === "Tilisiirto" && (
                                <p>Maksa tilisiirto tilisoitteeseen DANSKE BANK: FI37 8000 2203 1664 33. Lisää maksun yhteydessä kommenttikenttään tilauksen koodi: <b>{order[0].order_code}</b></p>
                            )}
                            {order[0].customer_paymentoption === "MobilePay" && (
                                <p>Maksa MobilePay puhelinnumeroon 050 5736934. Lisää maksun yhteydessä kommenttikenttään koodi: <b style={{ color: "#2155ff" }}>{order[0].order_code}</b></p>
                            )}
                            <hr className="separator" />
                            <h4>
                                Tilauksen seuranta: {steps.map((step, index) => (
                                    <span
                                        key={index}
                                        className={`status-step ${step === order[0].order_status ? 'active' : ''}`}
                                    >
                                        {step}
                                        {index < steps.length - 1 && <>&nbsp;→&nbsp;</>}
                                        {step === "Vastaanotettu" && order[0].order_status === "Vastaanotettu" && (
                                            <div className="tooltip">Tilauksesi on vastaanotettu, mutta PoppiMikko ei ole ottanut sitä vielä käsittelyyn.</div>
                                        )}
                                        {step === "Käsittelyssä" && order[0].order_status === "Käsittelyssä" && (
                                            <div className="tooltip">Tilauksesi on käsittelyssä. Käsittelyaika on 1-3 arkipäivää.</div>
                                        )}
                                        {step === "Toimitettu" && order[0].order_status === "Toimitettu" && (
                                            <div className="tooltip">Tilauksesi on toimitettu.</div>
                                        )}
                                    </span>
                                ))}
                            </h4>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}

export default OwnOrders;