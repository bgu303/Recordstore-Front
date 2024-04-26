import { useEffect, useState } from "react";
import { BASE_URL, BASE_URL_CLOUD } from './Apiconstants';
import '../styling/Orderlist.css'
import { Button } from "@mui/material";

function Orders() {
    const [orderData, setOrderData] = useState([]);

    useEffect(() => {
        fetch(`${BASE_URL}/shoppingcart/getorderdata`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Something went wrong");
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
    }, []);

    // Function to group an array of objects by a specified key, GPT MAGIC!
    function groupBy(array, key) {
        return array.reduce((result, currentValue) => {
            (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
            return result;
        }, {});
    }

    function getTotalPrice(order) {
        let totalPrice = 0;
        order.forEach(item => {
            totalPrice += item.price;
        });
        return totalPrice;
    }

    const deleteOrder = (data) => {
        console.log("order deleted " + data);
    }

    return (
        <>
            <div className="mainDiv">
                <h1>Tilaukset</h1>
                {Object.entries(orderData).map(([orderId, order]) => (
                    <div key={orderId} className="orderContainer">
                        <h2>Tilauksen ID: {orderId}</h2>
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
                        <Button color="error" variant="contained" onClick={() => deleteOrder(orderId)}>Poista</Button>
                    </div>
                ))}

            </div>
        </>
    );
}

export default Orders;
