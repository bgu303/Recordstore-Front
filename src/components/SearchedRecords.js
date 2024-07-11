import { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { BASE_URL, BASE_URL_CLOUD } from './Apiconstants';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-material.css';

function SearchedRecords({ searchResults, loggedInUser, showShoppingcart }) {

    const handleDiscogsLink = (data) => {
        const discogsSubStr = data.substring(1);
        fetch(`https://api.discogs.com/releases/${discogsSubStr}`)
            .then(response => response.json())
            .then(responseData => window.open(responseData.uri))
    }

    const addToCart = async (data) => {
        console.log(`UserId: ${loggedInUser.id} itemId: ${data.id}`);
        try {
            const response = await fetch(`${BASE_URL}/shoppingcart/addtocart`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    userId: loggedInUser.id,
                    recordId: data.id
                })
            })

            if (!response.ok) {
                if (response.status === 501) {
                    return alert("Levy on jo sinun tai toisen käyttäjän ostoskorissa");
                }
                return alert("Jokin meni vikaan lisätessä koriin");
            } else {
                showShoppingcart();
                alert("Koriin lisääminen onnistui!");
                return;
            }
        } catch (error) {
            console.log(`Error adding to cart: ${error}`);
        }
    }

    const [columnDefinitions, setColumnDefinitions] = useState([
        { field: "artist", headerName: "Artisti", suppressMovable: true, width: 240 },
        { field: "title", headerName: "Levyn nimi", suppressMovable: true, width: 270 },
        { field: "label", headerName: "Levy-yhtiö", suppressMovable: true, width: 200 },
        { field: "size", headerName: "Koko", suppressMovable: true, width: 120 },
        { field: "lev", headerName: "Rec", suppressMovable: true, width: 110 },
        { field: "kan", headerName: "PS", suppressMovable: true, width: 110 },
        { field: "price", headerName: "Hinta", suppressMovable: true, cellStyle: { textAlign: "right" }, width: 100 },
        { field: "genre", headerName: "Genre", suppressMovable: true, width: 150 },
        {
            field: "discogs",
            headerName: "Discogs",
            suppressMovable: true,
            width: 110,
            cellRenderer: params => (
                <div
                    style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                    onClick={() => handleDiscogsLink(params.data.discogs)}
                >
                    {params.data.discogs}
                </div>
            ),
        },
        {
            cellRenderer: params => <Button size="small" variant="contained" color="success" onClick={() => addToCart(params.data)}>Lisää Koriin</Button>,
            width: 160,
            suppressMovable: true,
            hide: !localStorage.getItem("isLoggedIn") || localStorage.getItem("loggedInUserRole") === "ADMIN"
        },
    ]);

    return (
        <>
        <h1 style={{ textAlign: "center"}}>Haun tulokset</h1>
        <div style={{ width: "95%", margin: "auto" }}>
            {searchResults && searchResults.length > 0 ? (
                <div className="ag-theme-material trainings" style={{ height: "750px", fontSize: 11 }}>
                    <AgGridReact
                        reactiveCustomComponents
                        rowData={searchResults}
                        columnDefs={columnDefinitions}
                        domLayout="autoHeight"
                        getRowHeight={() => 35}
                    />
                </div>
            ) : (
                <h3 style={{ textAlign: "center"}}>Ei hakutuloksia</h3>
            )}
        </div>
        </>
    );
}

export default SearchedRecords;