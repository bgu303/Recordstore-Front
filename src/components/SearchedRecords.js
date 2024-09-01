import { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-material.css';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import CircularProgress from '@mui/material/CircularProgress';

import { BASE_URL, BASE_URL_CLOUD } from './Apiconstants';

function SearchedRecords({ searchResults, loggedInUser, showShoppingcart }) {

    const [columnDefinitions, setColumnDefinitions] = useState([]);
    const [showPicture, setShowPicture] = useState(false);
    const [discogsImageUrl, setDiscogsImageUrl] = useState("");
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [imageLoadTimeout, setImageLoadTimeout] = useState(false);
    const DISCOGS_API_KEY = process.env.REACT_APP_DISCOGS_API_KEY;

    const handleDiscogsLink = (data) => {
        const discogsSubStr = data.substring(1);
        fetch(`https://api.discogs.com/releases/${discogsSubStr}`)
            .then(response => {
                if (!response.ok) {
                    return alert("Valitettavasti levyn discogs linkki ei toimi.")
                } else {
                    return response.json();
                }
            })
            .then(responseData => {
                window.open(responseData.uri)
            })
            .catch(error => {
                return alert("Discogs linkki ei toiminnassa.");
            })
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

    const displayImage = (data) => {
        console.log("moi")
        setShowPicture(true);
        setIsImageLoading(true);
        setImageLoadTimeout(false);

        const discogsId = data.discogs.slice(1);
        const url = `https://api.discogs.com/releases/${discogsId}`;

        fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Discogs token=${DISCOGS_API_KEY}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(data => {
                const imageUrl = data.images && data.images.length > 0 ? data.images[0].uri : null;
                if (imageUrl) {
                    setDiscogsImageUrl(imageUrl);
                    setIsImageLoading(false);
                } else {
                    setIsImageLoading(false);
                    setImageLoadTimeout(true);
                }
            })
            .catch(error => {
                console.error("Fetch error:", error);
                setIsImageLoading(false);
                setImageLoadTimeout(true);
            });
    }

    const closePicture = () => {
        setShowPicture(false);
        setDiscogsImageUrl("");
    }

    useEffect(() => {
        const updateColumnDefinitions = () => {
            const isMobile = window.innerWidth <= 768;

            setColumnDefinitions([
                { field: "artist", headerName: "Artisti", filter: true, suppressMovable: true, width: isMobile ? 190 : undefined, flex: isMobile ? undefined : 2 },
                { field: "title", headerName: "Levyn nimi", filter: true, suppressMovable: true, width: isMobile ? 190 : undefined, flex: isMobile ? undefined : 2 },
                { field: "label", headerName: "Levy-yhtiö", filter: true, suppressMovable: true, width: isMobile ? 190 : undefined, flex: isMobile ? undefined : 2 },
                { field: "year", headerName: "Vuosi", filter: true, suppressMovable: true, width: isMobile ? 120 : undefined, flex: isMobile ? undefined : 1, cellStyle: { textAlign: "center" } },
                { field: "size", headerName: "Koko", filter: true, suppressMovable: true, width: isMobile ? 120 : undefined, flex: isMobile ? undefined : 0.8, cellStyle: { textAlign: "center" } },
                { field: "lev", headerName: "Rec", filter: true, suppressMovable: true, width: isMobile ? 120 : undefined, flex: isMobile ? undefined : 0.8, cellStyle: { textAlign: "center" } },
                { field: "kan", headerName: "PS", filter: true, suppressMovable: true, width: isMobile ? 120 : undefined, flex: isMobile ? undefined : 0.8, cellStyle: { textAlign: "center" } },
                { field: "genre", headerName: "Genre", filter: true, suppressMovable: true, width: isMobile ? 120 : undefined, flex: isMobile ? undefined : 1.2, cellStyle: { textAlign: "center" }},
                { field: "price", headerName: "Hinta", filter: true, suppressMovable: true, cellStyle: { textAlign: "right" }, width: isMobile ? 100 : undefined, flex: isMobile ? undefined : 1 },
                {
                    field: "discogs",
                    headerName: "Discogs",
                    filter: true,
                    suppressMovable: true,
                    width: isMobile ? 120 : undefined, flex: isMobile ? undefined : 1.3,
                    cellStyle: { textAlign: "right" },
                    cellRenderer: params => (
                        <div
                            className="discogsLink"
                            onClick={() => handleDiscogsLink(params.data.discogs)}
                        >
                            {params.data.discogs}
                        </div>
                    ),
                },
                {
                    cellRenderer: params => (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                            <InsertPhotoIcon
                                style={{ cursor: "pointer", color: "#4682B4" }}
                                onClick={() => displayImage(params.data)}
                            />
                        </div>
                    ),
                    width: isMobile ? 80 : 90,
                    suppressMovable: true,
                    hide: !localStorage.getItem("isLoggedIn") || localStorage.getItem("loggedInUserRole") === "ADMIN"
                },
                {
                    cellRenderer: params => <Button size="small" variant="contained" color="success" onClick={() => addToCart(params.data)}>Lisää Koriin</Button>,
                    width: isMobile ? 170 : undefined,
                    flex: isMobile ? undefined : 1.5,
                    suppressMovable: true,
                    hide: !localStorage.getItem("isLoggedIn") || localStorage.getItem("loggedInUserRole") === "ADMIN"
                },
            ])
        }


        updateColumnDefinitions();
        window.addEventListener("resize", updateColumnDefinitions);

        return () => window.removeEventListener("resize", updateColumnDefinitions);
    }, [])

    // Define filter parameters to simplify the search box
    const simpleFilterParams = {
        filterOptions: ["contains"],
        defaultOption: "contains",
        suppressAndOrCondition: true,
    };

    // Apply filter parameters to column definitions
    const simplifiedColumnDefinitions = columnDefinitions.map(colDef => ({
        ...colDef,
        filterParams: simpleFilterParams, // Apply custom filter parameters
    }));

    const finnishTranslations = {
        filterOoo: "Hae...",
    };

    const gridOptions = {
        reactiveCustomComponents: true,
        suppressMenuHide: true
    };

    return (
        <>
            <h1 style={{ textAlign: "center" }}>Haun tulokset</h1>
            <div style={{ width: "95%", margin: "auto" }}>
                {searchResults && searchResults.length > 0 ? (
                    <div className="ag-theme-material trainings" style={{ height: "750px", fontSize: 11, fontWeight: "bold" }}>
                        <AgGridReact
                            reactiveCustomComponents
                            rowData={searchResults}
                            columnDefs={simplifiedColumnDefinitions}
                            domLayout="autoHeight"
                            getRowHeight={() => 35}
                            localeText={finnishTranslations}
                            gridOptions={gridOptions}
                        />
                    </div>
                ) : (
                    <h3 style={{ textAlign: "center" }}>Ei hakutuloksia</h3>
                )}
                {showPicture && (
                    <div className="discogsPictureDiv" onClick={closePicture}>
                        <div className="discogsPicture">
                            {isImageLoading ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CircularProgress size={24} style={{ marginRight: '10px' }} />
                                    <p>Ladataan kuvaa...</p>
                                </div>
                            ) : imageLoadTimeout ? (
                                <p>Kuva ei saatavilla.</p>
                            ) : discogsImageUrl ? (
                                <>
                                    <img src={discogsImageUrl} alt="Discogs Release" style={{ maxWidth: "100%", maxHeight: "100%" }} />
                                    <p style={{ fontSize: "0.8em", marginTop: "10px" }}>Huom: Myytävän levyn kunto voi olla eri kuin kuvassa. Katso levyn kuntoluokitus listauksesta.</p>
                                </>
                            ) : (
                                <p>Kuva ei saatavilla.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default SearchedRecords;