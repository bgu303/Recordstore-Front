import { useEffect, useState } from "react";
import '../styling/Orderlist.css'
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { BASE_URL } from './Apiconstants';

function Orders({ getAllOrders }) {
    const [orderData, setOrderData] = useState([]);
    const token = localStorage.getItem('jwtToken');
    const navigate = useNavigate();
    const [orderStatus, setOrderStatus] = useState("");

    const getOrders = () => {
        fetch(`${BASE_URL}/orders/getorderdata`, {
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
            fetch(`${BASE_URL}/orders/deleteorder/${data}`,
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
        fetch(`${BASE_URL}/orders/changeorderstatus/${id}/${orderStatus}`)
            .then(response => {
                if (!response.ok) {
                    console.log("Failed to update Status.");
                } else {
                    getOrders();
                    getAllOrders();
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

    const saveToFile = (content, filename) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const print = (orderItem) => {
        let textContent = "";

        textContent += "Tilaajan tiedot\n\n";
        textContent += `Nimi: ${orderItem[0].customer_name}\n`;
        textContent += `Sähköposti: ${orderItem[0].customer_email}\n`;
        textContent += `Puhelinnumero: ${orderItem[0].customer_phone}\n`;
        textContent += `Maksutapa: ${orderItem[0].customer_paymentoption}\n`;
        if (orderItem[0].customer_paymentoption === "MobilePay" || orderItem[0].customer_paymentoption === "Tilisiirto") {
            textContent += `Maksukoodi: ${orderItem[0].order_code}\n`;
        }
        textContent += `Toimitustapa: ${orderItem[0].customer_shippingoption}\n`;
        if (orderItem[0].customer_address) {
            textContent += `Osoite: ${orderItem[0].customer_address}\n`;
        }
        textContent += "\n";
        textContent += "LEVYT:\n\n";

        orderItem.forEach(item => {
            textContent += `${item.artist}, `;
            textContent += `${item.title}, `;
            textContent += `${item.label}, `;
            textContent += `${item.size}, `;
            textContent += `${item.price}€, `;
            textContent += `${item.shelf_space}\n\n`
        });

        const totalPrice = orderItem.reduce((total, item) => total + item.price, 0);

        let postageFee = 0;

        if (orderItem[0].customer_shippingoption === "Matkahuolto") {
            postageFee = 7.50;
            textContent += `Hinta yhteensä: ${totalPrice}€ + ${postageFee}€ postitusmaksu\n`;
        } else {
            textContent += `Hinta yhteensä: ${totalPrice}€\n`;
        }
        
        const finalPrice = totalPrice + postageFee;
        textContent += `Kokonaishinta: ${finalPrice}€\n`;

        const filename = `tilausId_${orderItem[0].id}.txt`;
        saveToFile(textContent, filename);
    };

    const deleteItemFromOrder = (orderId, recordId) => {
        const confirmation = window.confirm("Haluatko varmasti poistaa levyn tilauksesta?");

        if (confirmation) {
            fetch(`${BASE_URL}/orders/deletefromorder/${orderId}/${recordId}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (!response.ok) {
                        console.log("Failed to delete order item.");
                    } else {
                        getOrders();
                        getAllOrders();
                    }
                })
                .catch(error => {
                    console.log("Error deleting order item:", error);
                });
        }
    }

    return (
        <>
            <div className="mainDivAllOrders">
                <h1>Tilaukset</h1>
                {Object.entries(orderData).reverse().map(([orderId, order]) => (
                    <div key={orderId} className="orderContainer">
                        <h2>Tilauksen ID: <span style={{ color: "#2155ff" }}>{orderId}</span></h2>
                        <h2>Tilauksen Maksukoodi: <span style={{ color: "#2155ff" }}>{order[0].order_code}</span></h2>
                        <h3>Tilaus saapunut: {formattedDate(order[0].order_date)}</h3>
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
                            {order.map(item => {
                                return (
                                    <li style={{ marginBottom: "10px", lineHeight: "1.5rem" }} key={item.record_id}>
                                        <b>Artisti/Bändi:</b> {item.artist}<br />
                                        <b>Levyn nimi:</b> {item.title}<br />
                                        <b>Levy-yhtiö:</b> {item.label}<br />
                                        <b>Koko:</b> {item.size}<br />
                                        <b>Hinta:</b> {item.price}€<br />
                                        <Button onClick={() => deleteItemFromOrder(orderId, item.record_id)} size="small" color="error" variant="contained">Poista</Button>
                                    </li>
                                );
                            })}
                        </ul>
                        <p>
                            Hinta yhteensä: {getTotalPrice(order)}€
                            {order[0].customer_shippingoption === "Matkahuolto" && (
                                <>
                                    <b> + 7,50€ postitusmaksu</b>
                                    <br />
                                    <p>Kokonaishinta:
                                        <b> {(getTotalPrice(order) + 7.50).toFixed(2)}€</b>
                                    </p>
                                </>
                            )}
                        </p>
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
                            <Button color="error" variant="contained" onClick={() => deleteOrder(orderId)}>Poista koko tilaus</Button>
                        </div>
                        <div style={{ textAlign: "center", marginTop: "10px" }}>
                            <Button color="success" variant="contained" onClick={() => print(order)}>Tulosta</Button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

export default Orders;
