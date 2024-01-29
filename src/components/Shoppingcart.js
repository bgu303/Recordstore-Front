import * as React from 'react';
import { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-material.css';
import { Button } from '@mui/material';
import '../styling/Createuser.css';

function Shoppingcart({ loggedInUser }) {
    const [shoppingcart, setShoppingcart] = useState([]);
    let [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        showShoppingcart();
        for (let i = 0; i < shoppingcart.length; i++) {
            totalPrice += shoppingcart[i].price
        }
        setTotalPrice(totalPrice);
    }, [])

    const showShoppingcart = () => {
        fetch(`http://localhost:3001/records/shoppingcartitems/${loggedInUser.id}`)
            .then(response => response.json())
            .then(responseData => setShoppingcart(responseData))
    }

    const deleteFromShoppingcart = (data) => {
        if(window.confirm("Oletko varma että haluat poistaa levyn?")) {
            fetch(`http://localhost:3001/records/shoppingcartdelete/${data.id}`, {method: "DELETE"})
            .then(response => {
                if (response.ok) {
                    showShoppingcart();
                } else {
                    alert("Jotain meni vikaan.");
                    console.log(response)
                }
            })
        }
    }

    const [columnDefinitions, setColumnDefinitions] = useState([
        { field: "artist", headerName: "Artisti", filter: true, suppressMovable: true, flex: 1 },
        { field: "title", headerName: "Levyn nimi", filter: true, suppressMovable: true, flex: 1 },
        { field: "size", headerName: "Koko", filter: true, suppressMovable: true, flex: 1 },
        { field: "price", headerName: "Hinta", filter: true, suppressMovable: true, flex: 1 },
        {
            cellRenderer: params => <Button size="small" color="error" onClick={() => deleteFromShoppingcart(params.data)}>Poista</Button>,
            flex: 1,
        },
    ]);

    return (
        <>
        <h2>Ostoskori</h2>
        <div className="ag-theme-material trainings" style={{ height: "500px", width: "95%", margin: "auto" }}>
                <AgGridReact
                rowData={shoppingcart}
                columnDefs={columnDefinitions}
                pagination={true}
                paginationPageSize={20}
                domLayout="auto"
                />
            </div>
            <span>Ostoskorin yhteishinta: {totalPrice}</span>
        </>
    )
}

export default Shoppingcart;