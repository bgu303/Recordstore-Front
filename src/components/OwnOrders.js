import { useEffect, useState } from "react";
import { BASE_URL, BASE_URL_CLOUD } from "./Apiconstants";
import { useNavigate } from "react-router-dom";
import '../styling/Ownorderlist.css'

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
        fetch(`${BASE_URL_CLOUD}/orders/getorderdatabyid/${loggedInUser.id}`)
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
                console.log(orderData)
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
            <div className="mainDiv">
                <h2>Omat Tilaukseni</h2>
                {Object.keys(orderData).length === 0 ? (
                    <h4>Ei aktiivisia tilauksia.</h4>
                ) : (
                    Object.entries(orderData).reverse().map(([orderId, order]) => (
                        <div key={orderId} className="orderContainer">
                            <h3>Tilaus lähetetty: {formattedDate(order[0].order_date)}</h3>
                            {order.length > 0 && (
                                <>
                                    <p><b>Tilaajan Nimi:</b> {order[0].customer_name}</p>
                                    <p><b>Sähköposti:</b> {order[0].customer_email}</p>
                                    <p><b>Puhelinnumero:</b> {order[0].customer_email}</p>
                                    <p><b>Maksutapa:</b> {order[0].customer_paymentoption}</p>
                                    <p><b>Toimitustapa:</b> {order[0].customer_shippingoption}</p>
                                    <p><b>Osoite:</b> {order[0].customer_address}</p>
                                </>
                            )}
                            <ul>
                                <h3>Tuotteet</h3>
                                {order.map(item => {
                                    return (
                                        <li key={item.record_id}>
                                            <b>Artisti/Bändi:</b> {item.artist}<br />
                                            <b>Levyn nimi:</b> {item.title}<br />
                                            <b>Koko:</b> {item.size}<br />
                                            <b>Hinta:</b> {item.price}€<br />
                                        </li>
                                    );
                                })}
                            </ul>
                            <p>Hinta yhteensä: {getTotalPrice(order)}€</p>
                            <h4>
                                Tilauksen seuranta: {steps.map((step, index) => (
                                    <span
                                        key={index}
                                        className={`status-step ${step === order[0].order_status ? 'active' : ''}`}
                                    >
                                        {step}
                                        {index < steps.length - 1 && <>&nbsp;→&nbsp;</>}
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