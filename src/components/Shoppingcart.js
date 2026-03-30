import { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-material.css';
import { Button, TextField } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import { useNavigate } from "react-router-dom";
import '../styling/Shoppingcart.css'

import { BASE_URL } from './Apiconstants';

function Shoppingcart({ loggedInUser, customerInfo, setCustomerInfo, cartTotal, setCartTotal, shoppingcart, setShoppingcart, setShoppingcartSize, conversationId }) {
    const [columnDefinitions, setColumnDefinitions] = useState([]);
    const [shippingOptionChecker, setShippingOptionChecker] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('jwtToken');
    const [message, setMessage] = useState("");

    // Guest token functions
    const generateGuestToken = () => {
        return 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    };

    const readGuestToken = () => {
        let token = localStorage.getItem("guestToken");
        if (!token) {
            const match = document.cookie.match(/(?:^|;\s*)guestToken=([^;]+)/);
            if (match) token = match[1];
        }
        return token;
    };

    const writeGuestToken = (token) => {
        localStorage.setItem("guestToken", token);
        document.cookie = `guestToken=${token}; path=/; max-age=${60 * 60 * 24 * 365}`;
    };

    const getOrCreateGuestToken = () => {
        let guestToken = readGuestToken();
        if (!guestToken) {
            guestToken = generateGuestToken();
            writeGuestToken(guestToken);
        }
        return guestToken;
    };

    // Guest users are allowed - no redirect needed

    useEffect(() => {
        // Ensure guest token exists before loading cart
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        if (!isLoggedIn) {
            getOrCreateGuestToken();
        }
        showShoppingcart();
    }, []);

    useEffect(() => {
        setCustomerInfo({
            name: "",
            phoneNumber: "",
            email: "",
            address: "",
            paymentOption: "",
            shippingOption: "",
            message: ""
        });
    }, [])

    useEffect(() => {
        if (customerInfo.shippingOption === "Nouto Vuosaaresta") {
            setShippingOptionChecker(false);
        } else if (customerInfo.shippingOption === "Matkahuolto") {
            setShippingOptionChecker(true);
        }
    }, [customerInfo.shippingOption])

    useEffect(() => {
        calculateTotalAmount();
    }, [shoppingcart]);

    const calculateTotalAmount = () => {
        let total = 0;
        shoppingcart.forEach(item => {
            total += item.price;
        });
        setCartTotal(total);
    };

    const handlePaymentOption = (e) => {
        setCustomerInfo({ ...customerInfo, paymentOption: e.target.value });
    }

    const handleShippingOption = (e) => {
        setCustomerInfo({ ...customerInfo, shippingOption: e.target.value })
    }

    const showShoppingcart = () => {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

        if (isLoggedIn) {
            // Logged in user: fetch from backend
            fetch(`${BASE_URL}/shoppingcart/shoppingcartitems/${localStorage.getItem("loggedInUserId")}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
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
                    setShoppingcart(responseData)
                    setShoppingcartSize(responseData.length)
                })
        } else {
            // Guest user: fetch from backend using guest token
            const guestToken = getOrCreateGuestToken();
            fetch(`${BASE_URL}/shoppingcart/shoppingcartitems/${guestToken}`)
                .then(response => {
                    if (response.ok) return response.json();
                    else throw new Error("Failed to fetch guest cart");
                })
                .then(responseData => {
                    setShoppingcart(responseData);
                    setShoppingcartSize(responseData.length);
                })
                .catch(error => {
                    console.error('Error loading guest cart from server:', error);
                    setShoppingcart([]);
                    setShoppingcartSize(0);
                });
        }
    }

    const deleteFromShoppingcart = (data) => {
        if (window.confirm("Oletko varma että haluat poistaa levyn?")) {
            const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

            if (isLoggedIn) {
                // Logged in user: delete from backend
                if (!token) {
                    return alert("Jokin meni vikaan");
                }

                fetch(`${BASE_URL}/shoppingcart/shoppingcartdelete/${data.id}`, {
                    method: "DELETE",
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
                    .then(response => {
                        if (response.ok) {
                            showShoppingcart();
                        } else {
                            alert("Jotain meni vikaan.");
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert("Jotain meni vikaan.");
                    });
            } else {
                // Guest user: delete via backend using guest token
                const guestToken = readGuestToken();

                if (!guestToken) {
                    return alert("Jokin meni vikaan - istuntosesi on vanhentunut.");
                }

                fetch(`${BASE_URL}/shoppingcart/guestdelete/${data.id}`, {
                    method: "DELETE",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ guestToken })
                })
                    .then(response => {
                        if (response.ok) {
                            showShoppingcart();
                        } else {
                            return response.text().then(text => {
                                console.error('Guest delete error response:', text);
                                alert("Jotain meni vikaan.");
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Error deleting guest cart item:', error);
                        alert("Jotain meni vikaan.");
                    });
            }
        }
    }

    const sendMessageOrderNotificationMessage = (orderId, orderCode) => {
        // Only send message if user is logged in (has conversationId)
        if (!conversationId || !token) {
            return;
        }

        const message = `Uusi tilaus vastaanotettu!\n\nTilauksen ID: ${orderId}\n\nNimi: ${customerInfo.name}\n\nSähköposti: ${customerInfo.email}\n\nPuhelinnumero: ${customerInfo.phoneNumber}\n\nMaksutapa: ${customerInfo.paymentOption}${(customerInfo.paymentOption === "MobilePay" || customerInfo.paymentOption === "Tilisiirto") ? `\n\nMaksukoodi: ${orderCode}` : ""}\n\nToimitustapa: ${customerInfo.shippingOption} ${customerInfo.address ? `\n\nOsoite:\n${customerInfo.address}` : ""}`;

        fetch(`${BASE_URL}/chat/sendautomatedmessage`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conversationId: conversationId,
                message: message
            })
        })
            .then(response => response.json())
            .then(data => {
            })
            .catch(error => {
                console.error('Error sending message:', error);
            });
        setMessage("");
    }

    const sendOrder = async () => {
        if (customerInfo.name.trim() === "" || customerInfo.phoneNumber.trim() === "" || customerInfo.email.trim() === "") {
            return alert("Täytä kaikki tilaukseen liittyvät kentät.");
        }
        if (customerInfo.name.length > 40) {
            return alert("Nimen tulee olla enintään 40 merkkiä pitkä.");
        }
        if (customerInfo.email.length > 50) {
            return alert("Sähköpostiosoite ei voi olla yli 50 merkkiä pitkä.");
        }
        if (customerInfo.address.length > 200) {
            return alert("Osoite ei voi olla yli 200 merkkiä pitkä.");
        }
        if (!/^\d+$/.test(customerInfo.phoneNumber)) {
            return alert("Puhelinnumeron tulee sisältää vain numeroita.");
        }
        if (customerInfo.phoneNumber.length > 15) {
            return alert("Puhelinnumero ei voi olla yli 15 merkkiä pitkä.");
        }
        if (customerInfo.address.trim() === "" && customerInfo.shippingOption === "Matkahuolto") {
            return alert("Täytä kaikki tilaukseen liittyvät kentät.");
        }
        if (shoppingcart.length === 0) {
            return alert("Ostoskori on tyhjä. Lisää tuotteita ennen tilauksen lähettämistä.");
        }
        if (cartTotal < 20) {
            return alert("Ei alle 20 euron tilauksia.");
        }
        if (customerInfo.paymentOption === "Käteinen" && customerInfo.shippingOption === "Matkahuolto") {
            return alert("Tilausta, joka lähetetään Matkahuollon kautta ei voi maksaa käteisellä. Valitse toinen maksutapa.")
        }

        if (window.confirm("Lähetetäänkö ostoskori?")) {
            try {
                const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
                const userId = isLoggedIn ? loggedInUser.id : null;
                const guestToken = !isLoggedIn ? readGuestToken() : null;

                const response = await fetch(`${BASE_URL}/shoppingcart/sendcart`, {
                    method: "POST",
                    headers: { "Content-type": "application/json" },
                    body: JSON.stringify({
                        customerInfo,
                        userId: userId,
                        guestToken: guestToken,
                        shoppingcart: shoppingcart
                    })
                });

                if (response.ok) {
                    const data = await response.json();

                    if (data.success) {
                        if (isLoggedIn) {
                            // Logged in user: delete from backend
                            const deleteResponse = await fetch(`${BASE_URL}/shoppingcart/shoppingcartdeleteall/${userId}`, { method: "DELETE" });

                            if (deleteResponse.ok) {
                                showShoppingcart();
                            } else {
                                console.error('Failed to clear logged-in user cart');
                            }
                        } else {
                            // Guest user: tell backend to clear cart by token
                            if (guestToken) {
                                const deleteResponse = await fetch(`${BASE_URL}/shoppingcart/shoppingcartdeleteall/${guestToken}`, { method: "DELETE" });
                                if (deleteResponse.ok) {
                                    showShoppingcart();
                                } else {
                                    console.error('Failed to clear guest cart');
                                }
                            } else {
                                console.warn('No guest token found, cart may not be cleared');
                                showShoppingcart();
                            }
                        }

                        // Send notification message if applicable
                        sendMessageOrderNotificationMessage(data.orderId, data.orderCode);

                        // Store order info for display in ordersummary
                        localStorage.setItem('lastOrderId', data.orderId);
                        localStorage.setItem('lastOrderCode', data.orderCode);

                        navigate("/ordersummary");
                    } else {
                        alert("Jotain meni vikaan.");
                    }
                } else {
                    const errorText = await response.text();
                    console.error('Order submission failed:', response.status, errorText);
                    alert("Jotain meni vikaan.");
                }
            } catch (error) {

                alert("Jotain meni vikaan.");
            }
        } else {
            alert("Ostoskoria ei lähetetty.");
        }
    }

    useEffect(() => {
        const updateColumnDefinitions = () => {
            const isMobile = window.innerWidth <= 768;
            setColumnDefinitions([
                { field: "artist", headerName: "Artisti", filter: false, suppressMovable: true, width: isMobile ? 190 : undefined, flex: isMobile ? undefined : 2 },
                { field: "title", headerName: "Levyn nimi", filter: false, suppressMovable: true, width: isMobile ? 190 : undefined, flex: isMobile ? undefined : 2 },
                { field: "size", headerName: "Koko", filter: false, suppressMovable: true, width: isMobile ? 120 : undefined, flex: isMobile ? undefined : 2 },
                { field: "price", headerName: "Hinta", filter: false, suppressMovable: true, cellStyle: { textAlign: "right" }, width: isMobile ? 100 : undefined, flex: isMobile ? undefined : 1 },
                {
                    cellRenderer: params => <Button size="small" color="error" variant="contained" onClick={() => deleteFromShoppingcart(params.data)}>Poista</Button>,
                    width: isMobile ? 170 : undefined,
                    flex: isMobile ? undefined : 1,
                    cellStyle: { textAlign: "center" }
                },
            ]);
        }

        updateColumnDefinitions();
        window.addEventListener("resize", updateColumnDefinitions);

        return () => window.removeEventListener("resize", updateColumnDefinitions);
    }, [])

    return (
        <>
            <h2 style={{ textAlign: "center" }}>Ostoskori</h2>
            {shoppingcart.length === 0 ? (
                <h3 style={{ textAlign: "center" }}>Ostoskori on tyhjä. Lisää tuotteita levylistasta ostoskoriin.</h3>
            ) : (
                <>
                    <h3 style={{ textAlign: "center" }}>HUOM! Tilattujen tuotteiden yhteissumma tulee olla 20 euroa tai enemmän.</h3>
                    <h3 style={{ textAlign: "center" }}>Tuotteet säilyvät ostoskorissa 24 tuntia.</h3>
                    <div className="ag-theme-material trainings" style={{ height: "500px", width: "95%", margin: "auto", fontWeight: "bold" }}>
                        <AgGridReact
                            rowData={shoppingcart}
                            columnDefs={columnDefinitions}
                            domLayout="auto"
                        />
                    </div>
                    <h3 style={{ marginLeft: "20px" }}>
                        Tilauksen hinta: {cartTotal} €
                        <div>Postimaksu (jos ei nouto Vuosaaresta): 7,50€</div>
                        <div>Yhteensä: {(cartTotal + 7.50).toFixed(2)} €</div>
                    </h3>

                    <div className="orderInfoDiv">
                        <h3>Tilaajan Tiedot</h3>
                        <TextField label="Koko nimi*"
                            onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                            value={customerInfo.name}
                            style={{ backgroundColor: "white", borderRadius: 10 }}
                        />
                        <TextField label="Puhelinnumero*"
                            onChange={e => setCustomerInfo({ ...customerInfo, phoneNumber: e.target.value })}
                            value={customerInfo.phoneNumber}
                            style={{ backgroundColor: "white", borderRadius: 10 }}
                        />
                        <TextField label="Sähköposti*"
                            onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                            value={customerInfo.email}
                            style={{ backgroundColor: "white", borderRadius: 10 }}
                        />
                        <div>
                            <FormControl>
                                <FormLabel>Maksutapa*</FormLabel>
                                <RadioGroup
                                    aria-label="paymentOption"
                                    name="paymentOption"
                                    value={customerInfo.paymentOption}
                                    onChange={handlePaymentOption}
                                >
                                    <FormControlLabel
                                        value="Käteinen"
                                        control={<Radio />}
                                        label="Käteinen"
                                    />
                                    <FormControlLabel
                                        value="MobilePay"
                                        control={<Radio />}
                                        label="MobilePay"
                                    />
                                    <FormControlLabel
                                        value="Tilisiirto"
                                        control={<Radio />}
                                        label="Tilisiirto"
                                    />
                                </RadioGroup>
                            </FormControl>
                        </div>
                        <div>
                            <FormControl>
                                <FormLabel>Toimitustapa*</FormLabel>
                                <RadioGroup
                                    aria-label="shippingOption"
                                    name="shippingOption"
                                    value={customerInfo.shippingOption}
                                    onChange={handleShippingOption}
                                >
                                    <FormControlLabel
                                        value="Matkahuolto"
                                        control={<Radio />}
                                        label="Matkahuolto"
                                    />
                                    <FormControlLabel
                                        value="Nouto Vuosaaresta"
                                        control={<Radio />}
                                        label="Nouto Vuosaaresta"
                                    />
                                </RadioGroup>
                            </FormControl>
                        </div>
                        {customerInfo.shippingOption === "Matkahuolto" && (
                            <>
                                <div>Kätevin Matkahuollon pakettipiste/-automaatti</div>
                                <TextField label="Matkahuollon toimipiste"
                                    onChange={e => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                                    value={customerInfo.address}
                                    multiline
                                    rows={4}
                                    style={{ backgroundColor: "white", borderRadius: 10, width: 400 }}
                                />
                            </>
                        )}
                        <TextField label="Lisäviesti tilaukseen"
                            onChange={e => setCustomerInfo({ ...customerInfo, message: e.target.value })}
                            value={customerInfo.message || ""}
                            multiline
                            rows={3}
                            style={{ backgroundColor: "white", borderRadius: 10, width: 400 }}
                        />
                        <div style={{ textAlign: "center", marginBottom: "15px" }}>
                            <Button size="large" color="success" variant="contained" onClick={() => sendOrder()}>Lähetä</Button>
                        </div>
                    </div>
                </>
            )}
        </>
    );

}

export default Shoppingcart;