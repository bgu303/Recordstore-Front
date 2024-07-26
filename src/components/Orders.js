import { useEffect, useState } from "react";
import '../styling/Orderlist.css'
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { BASE_URL, BASE_URL_CLOUD } from './Apiconstants';

function Orders() {
    const [orderData, setOrderData] = useState([]);
    const token = localStorage.getItem('jwtToken');
    const navigate = useNavigate();
    const [orderStatus, setOrderStatus] = useState("");

    const getOrders = () => {
        fetch(`${BASE_URL_CLOUD}/orders/getorderdata`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    navigate("/records");
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

    useEffect(() => {
        getOrders();
    }, []);

    const deleteOrder = (data) => {
        if (window.confirm("Haluatko varmasti poistaa Tilauksen?")) {
            fetch(`${BASE_URL_CLOUD}/orders/deleteorder/${data}`,
                {
                    method: "DELETE",
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => {
                    if (response.ok) {
                        getOrders();
                    } else {
                        alert("Jotain meni vikaan");
                    }
                })
        }
    }

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

    const formattedDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based.
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}.${month}.${year}. Kello ${hours}:${minutes}`;
    };

    const handleStatusChange = (e) => {
        setOrderStatus(e.target.value)
    }

    const changeStatus = (id) => {
        if (orderStatus === "") {
            return;
        }
        fetch(`${BASE_URL_CLOUD}/orders/changeorderstatus/${id}/${orderStatus}`)
            .then(response => {
                if (!response.ok) {
                    console.log("Failed to update Status.");
                } else {
                    getOrders();
                }
            })
            .catch(error => {
                console.log("Error updating Status:", error);
            })
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "Vastaanotettu":
                return "red";
            case "Käsittelyssä":
                return "#FFA500";
            case "Toimitettu":
                return "green";
            default:
                return "black";
        }
    }

    return (
        <>
            <div className="mainDivAllOrders">
                <h1>Tilaukset</h1>
                {Object.entries(orderData).reverse().map(([orderId, order]) => (
                    <div key={orderId} className="orderContainer">
                        <h2>Tilauksen ID: {orderId}</h2>
                        <h3>Tilaus saapunut: {formattedDate(order[0].order_date)}</h3>
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
                        <hr className="separator" />
                        <ul>
                            <h3 style={{ textAlign: "center" }}>Tuotteet</h3>
                            {order.map(item => {
                                return (
                                    <li style={{ marginBottom: "10px", lineHeight: "1.5rem" }} key={item.record_id}>
                                        <b>Artisti/Bändi:</b> {item.artist}<br />
                                        <b>Levyn nimi:</b> {item.title}<br />
                                        <b>Koko:</b> {item.size}<br />
                                        <b>Hinta:</b> {item.price}€<br />
                                    </li>
                                );
                            })}
                        </ul>
                        <p>Hinta yhteensä: {getTotalPrice(order)}€</p>
                        <hr className="separator" />
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                            <label style={{ marginRight: '10px' }}>Muuta Status</label>
                            <select value={orderStatus} style={{ marginRight: '10px' }} onChange={handleStatusChange}>
                                <option value="">Valitse Status</option>
                                <option value="Käsittelyssä">Käsittelyssä</option>
                                <option value="Toimitettu">Toimitettu</option>
                            </select>
                            <button
                                onClick={() => changeStatus(order[0].id)}
                                style={{
                                    padding: "5px 10px",
                                    fontSize: "12px",
                                    background: "white",
                                    borderRadius: "5px",
                                    color: "inherit",
                                    cursor: "pointer"
                                }}
                            >
                                Muuta status
                            </button>

                        </div>
                        <h4>Status: <span style={{ color: getStatusColor(order[0].order_status) }}>{order[0].order_status}</span></h4>
                        <div style={{ textAlign: "center" }}>
                            <Button color="error" variant="contained" onClick={() => deleteOrder(orderId)}>Poista</Button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

export default Orders;
