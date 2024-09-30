import * as React from 'react';
import { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-material.css';
import { Button } from '@mui/material';
import TextField from '@mui/material/TextField';
import Sizefilter from './Sizefilter';
import '../styling/Records.css'
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import CircularProgress from '@mui/material/CircularProgress';
import EditIcon from '@mui/icons-material/Edit';

import { BASE_URL } from './Apiconstants';

function Records({ isLoggedIn, loggedInUser, onModelChange, showShoppingcart }) {
    const [columnDefinitions, setColumnDefinitions] = useState([]);
    const [records, setRecords] = useState([]);
    const token = localStorage.getItem("jwtToken")
    const [showPicture, setShowPicture] = useState(false);
    const [discogsImageUrl, setDiscogsImageUrl] = useState("");
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [imageLoadTimeout, setImageLoadTimeout] = useState(false);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [editedRecord, setEditedRecord] = useState({});
    const [originalSoldStatus, setOriginalSoldStatus] = useState(null);
    const DISCOGS_API_KEY = process.env.REACT_APP_DISCOGS_API_KEY;

    const getRecords = () => {
        fetch(`${BASE_URL}/records`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Something went wrong");
                }
            })
            .then(responseData => {
                // Filter out sold records if the user is not an admin.
                if (localStorage.getItem("loggedInUserRole") !== "ADMIN") {
                    responseData = responseData.filter(record => record.sold === 0);
                }
                setRecords(responseData);
            })
            .catch(error => {
                console.log(error.message);
                setRecords([]);
            });
    }

    const handleDiscogsLink = (data) => {
        const discogsSubStr = data.substring(1);
        fetch(`https://api.discogs.com/releases/${discogsSubStr}`)
            .then(response => {
                if (!response.ok) {
                    return alert("Tätä levyä ei tällä hetkellä löydy Discogsista.")
                } else {
                    return response.json();
                }
            })
            .then(responseData => {
                window.open(responseData.uri)
            })
            .catch(error => {
                return alert("Tätä levyä ei tällä hetkellä löydy Discogsista.");
            })
    }

    const deleteRecord = (data) => {
        if (window.confirm("Oletko varma että haluat poistaa levyn?")) {
            fetch(`${BASE_URL}/records/${data.id}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        getRecords();
                    } else {
                        alert("Jotain meni vikaan.");
                    }
                })
        }
    }

    const editRecord = (record) => {
        setEditedRecord(record);
        setOriginalSoldStatus(record.sold);
        setIsEditPopupOpen(true);  
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedRecord((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditComplete = (data) => {
        // Ensure "sold" is preserved in the updated record
        const updatedRecord = {
            ...editedRecord,
            sold: originalSoldStatus.sold
        };

        fetch(`${BASE_URL}/records/editrecord`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ record: updatedRecord })
        })
            .then(response => response.json())
            .then(data => {
                setIsEditPopupOpen(false);
                getRecords();
            })
            .catch(error => {
                console.error("Error updating record: ", error);
            });
    };

    const addToCart = async (data) => {
        console.log(data)
        try {
            const response = await fetch(`${BASE_URL}/shoppingcart/addtocart`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    userId: localStorage.getItem("loggedInUserId"),
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
                alert(`Ostoskoriin lisääminen onnistui!\nArtisti: ${data.artist}\nLevyn nimi: ${data.title}\nKoko: ${data.size}\nKannen kunto: ${data.kan}\nLevyn kunto: ${data.lev}\nHinta: ${data.price}`);
                return;
            }
        } catch (error) {
            console.log(`Error adding to cart: ${error}`);
        }
    }

    const changeStatus = (data) => {
        //If data.sold === 0, it means that the value is false, and the record hasnt been sold. If data.sold === 1, it means the value is true, and the record has been sold
        let soldStatus = data.sold;
        let recordId = data.id

        if (soldStatus === 0) {
            fetch(`${BASE_URL}/records/updatesoldstatustosold/${recordId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        getRecords();
                    } else {
                        console.error("Failed to update sold status");
                    }
                })
                .catch(error => {
                    console.error("Error updating sold status:", error);
                });
        }

        if (soldStatus === 1) {
            fetch(`${BASE_URL}/records/updatesoldstatustonotsold/${recordId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        getRecords();
                    } else {
                        console.error("Failed to update sold status");
                    }
                })
                .catch(error => {
                    console.error("Error updating sold status:", error);
                });
        }
    }

    useEffect(() => {
        getRecords();
    }, [isLoggedIn])

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
                { field: "genre", headerName: "Genre", filter: true, suppressMovable: true, width: isMobile ? 120 : undefined, flex: isMobile ? undefined : 1.2, cellStyle: { textAlign: "center" } },
                { field: "price", headerName: "€uro", filter: true, suppressMovable: true, cellStyle: { textAlign: "right" }, width: isMobile ? 100 : undefined, flex: isMobile ? undefined : 1 },
                {
                    field: "discogs",
                    headerName: "Discogs",
                    filter: true,
                    suppressMovable: true,
                    width: isMobile ? 120 : undefined, flex: isMobile ? undefined : 1.2,
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
                    headerName: "Kuva",
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
                    cellStyle: { textAlign: "center" },
                    hide: !localStorage.getItem("isLoggedIn") || localStorage.getItem("loggedInUserRole") === "ADMIN"
                },
                {
                    cellRenderer: params => <Button size="small" variant="contained" color="error" onClick={() => deleteRecord(params.data)}>Poista</Button>,
                    width: isMobile ? 170 : undefined,
                    flex: isMobile ? undefined : 1.2,
                    suppressMovable: true,
                    cellStyle: { textAlign: "center" },
                    hide: localStorage.getItem("loggedInUserRole") !== "ADMIN"
                },
                {
                    field: "sold", headerName: "Status", filter: true, suppressMovable: true,
                    width: isMobile ? 150 : undefined,
                    flex: isMobile ? undefined : 1.2,
                    hide: localStorage.getItem("loggedInUserRole") !== "ADMIN",
                    cellRenderer: params => {
                        return params.value === 0 ? "Myytävänä" : "Myyty";
                    }
                },
                {
                    cellRenderer: params => <Button size="small" variant="contained" color="success" onClick={() => changeStatus(params.data)}>Status</Button>,
                    width: isMobile ? 150 : undefined,
                    flex: isMobile ? undefined : 1.2,
                    suppressMovable: true,
                    cellStyle: { textAlign: "center" },
                    hide: localStorage.getItem("loggedInUserRole") !== "ADMIN"
                },
                {
                    cellRenderer: params => (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                            <EditIcon
                                style={{ cursor: "pointer", color: "#4682B4" }}
                                onClick={() => editRecord(params.data)}
                            />
                        </div>
                    ),
                    width: isMobile ? 80 : 90,
                    suppressMovable: true,
                    hide: localStorage.getItem("loggedInUserRole") !== "ADMIN"
                },
            ]);
        };

        updateColumnDefinitions();
        window.addEventListener("resize", updateColumnDefinitions);

        return () => window.removeEventListener("resize", updateColumnDefinitions);
    }, []);

    const finnishTranslations = {
        filterOoo: "Hae...",
    };

    //This needs to be added in order to use custom filtering tools.
    const gridOptions = {
        reactiveCustomComponents: true,
        suppressMenuHide: true,
    };

    const closePicture = () => {
        setShowPicture(false);
        setDiscogsImageUrl("");
    }

    const displayImage = (data) => {
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

    return (
        <>
            <h1 style={{ textAlign: "center" }}>PoppiMikon levylista</h1>
            <div className="ag-theme-material trainings" style={{ height: "80vh", width: "95%", margin: "auto", fontSize: 11, fontWeight: "bold" }}>
                <AgGridReact
                    reactiveCustomComponents
                    rowData={records}
                    columnDefs={simplifiedColumnDefinitions}
                    localeText={finnishTranslations}
                    getRowHeight={() => 40}
                    gridOptions={{
                        ...gridOptions,
                        pagination: true,
                        paginationPageSize: 1000
                    }}
                />
            </div>
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
            {isEditPopupOpen && (
                <div className="popup-overlay">
                    <div className="popup-inner">
                        <h2>Muokkaa levyä</h2>
                        <form>
                            <TextField
                                label="Artisti"
                                name="artist"
                                value={editedRecord.artist || ''}
                                onChange={handleInputChange}
                                margin="normal"
                                size="small"
                                fullWidth
                            />
                            <TextField
                                label="Levyn nimi"
                                name="title"
                                value={editedRecord.title || ''}
                                onChange={handleInputChange}
                                margin="normal"
                                size="small"
                                fullWidth
                            />
                            <TextField
                                label="Levy-yhtiö"
                                name="label"
                                value={editedRecord.label || ''}
                                onChange={handleInputChange}
                                margin="normal"
                                size="small"
                                fullWidth
                            />
                            <TextField
                                label="Vuosi"
                                name="year"
                                type="number"
                                value={editedRecord.year || ''}
                                onChange={handleInputChange}
                                margin="normal"
                                size="small"
                                fullWidth
                            />
                            <TextField
                                label="Koko"
                                name="size"
                                value={editedRecord.size || ''}
                                onChange={handleInputChange}
                                margin="normal"
                                size="small"
                                fullWidth
                            />
                            <TextField
                                label="Rec"
                                name="lev"
                                value={editedRecord.lev || ''}
                                onChange={handleInputChange}
                                margin="normal"
                                size="small"
                                fullWidth
                            />
                            <TextField
                                label="PS"
                                name="kan"
                                value={editedRecord.kan || ''}
                                onChange={handleInputChange}
                                margin="normal"
                                size="small"
                                fullWidth
                            />
                            <TextField
                                label="Discogs"
                                name="discogs"
                                value={editedRecord.discogs || ''}
                                onChange={handleInputChange}
                                margin="normal"
                                size="small"
                                fullWidth
                            />
                            <TextField
                                label="Genre"
                                name="genre"
                                value={editedRecord.genre || ''}
                                onChange={handleInputChange}
                                margin="normal"
                                size="small"
                                fullWidth
                            />
                            <TextField
                                label="€uro"
                                name="price"
                                type="number"
                                value={editedRecord.price || ''}
                                onChange={handleInputChange}
                                margin="normal"
                                size="small"
                                fullWidth
                            />
                            <TextField
                                label="Hyllypaikka"
                                name="shelf_space"
                                value={editedRecord.shelf_space || ''}
                                onChange={handleInputChange}
                                margin="normal"
                                size="small"
                                fullWidth
                            />
                        </form>
                        <div className="popup-buttons">
                            <Button variant="contained" color="success" onClick={handleEditComplete}>
                                Valmis
                            </Button>
                            <Button variant="contained" color="error" onClick={() => setIsEditPopupOpen(false)}>
                               Peruuta
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Records;
