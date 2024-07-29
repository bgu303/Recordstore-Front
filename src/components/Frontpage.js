import * as React from 'react';
import { useState, useEffect } from 'react';
import '../styling/Frontpage.css'
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-material.css';
import { useNavigate } from "react-router-dom";
import Footer from './Footer';
import ImageBanner from './Imagebanner';

import { BASE_URL, BASE_URL_CLOUD } from './Apiconstants';

function FrontPage() {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [randomRecords, setRandomRecords] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [playlists, setPlaylists] = useState([])
    const columnDefs = [
        { headerName: "Artisti", field: "artist", width: 240, filter: false, suppressMovable: true, sortable: false },
        { headerName: "Levyn nimi", field: "title", width: 240, filter: false, suppressMovable: true, sortable: false },
        { headerName: "Hinta", field: "price", width: 100, cellStyle: { textAlign: "right" }, filter: false, suppressMovable: true, sortable: false }
    ];

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
                setRecords(responseData);
                getRandomRecords();
            })
            .catch(error => {
                console.log(error.message);
                setRecords([]);
            });
    }

    const showNotifications = () => {
        fetch(`${BASE_URL}/notifications/`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    console.log("Failed to fetch notifications.")
                }
            })
            .then(responseData => {
                setNotifications(responseData)
            })
    }

    const showPlaylists = () => {
        fetch(`${BASE_URL}/playlists/`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    console.log("Failed to fetch playlists.")
                }
            })
            .then(responseData => {
                setPlaylists(responseData)
            })
    }

    useEffect(() => {
        showNotifications();
        showPlaylists();
    }, [])

    useEffect(() => {
        getRecords();
    }, []);

    useEffect(() => {
        getRandomRecords();
    }, [records])

    useEffect(() => {
        const intervalId = setInterval(getRandomRecords, 8000);
        return () => clearInterval(intervalId);
    }, [records]);

    const getRandomRecords = () => {
        const shuffled = records.sort(() => 0.5 - Math.random());
        const selectedRecords = shuffled.slice(0, 10);
        setRandomRecords(selectedRecords)
    }

    // Function to render playlists by source
    const renderPlaylists = (source) => {
        return playlists
            .filter(playlist => playlist.playlist_source === source).reverse()
            .map((playlist, index) => (
                <div key={index}>
                    <a className="homePageAnchorTag" href={playlist.playlist_url} target="_blank" rel="noopener noreferrer">
                        {playlist.playlist_name}
                    </a>
                    <br />
                </div>
            ));
    };

    return (
        <>
            <div className="frontPageMainDiv">
                <h1 className="frontPageTitle">Tervetuloa PoppiMikon levykauppaan</h1>
                <ImageBanner />
            </div>
            <div className="contentSection">
                <div className="section">
                    <h2 className="homePageTitles">Hinnoittelu</h2>
                    <p className="homePageParagraph">
                        Lähtökohtana olen käyttänyt Discogsin mediaanihintaa. Osa näistä levyistä on huomattavan hyvässä kunnossa, jolloin olen laittanut hinnan hieman ylemmäksi. Muutamassa tapauksessa jopa selvästi korkeammaksi. Mutta jokaine hintahan on ostajan harkittavissa ja koska tällä kertaa myyn pakon edessä omia levyjäni, niin <b><u>EI ALENNUKSIA !!!</u></b> eli jos olet ostamassa, niin älä laske budjettiasi alennusten varaan. Tämä on selkeä pelin henki (SORRY !!!) ja koskee kaikkia.
                    </p>
                </div>
                <div className="vertical-line"></div>
                <div className="section">
                    <h2 className="homePageTitles">Discogs numero</h2>
                    <p className="homePageParagraph">
                        Jokaisella levyllä tuolla Discogsissa on oma numeronsa, joka löytyy joka kohteen kohdalla. Aiemmin kun olen näitä levyjä myynyt, niin usein kysytään, että mikä painos. Nyt pystyt itse tsekkaamaan asian klikkaamalla levyn discogs numeroa levylistassa, niin pääset suoraan levyn discogs-sivulle.
                    </p>
                </div>
                <div className="vertical-line"></div>
                <div className="section">
                    <h2 className="homePageTitles">Levyjen kunto</h2>
                    <p className="homePageParagraph">
                        Kunnot on arvioitu pääosin vain visuaalisesti. Ensimmäinen sarake on levy <b>(Rec)</b>, toinen kansi <b>(PS)</b>. Jos se on tyhjä, niin ei kantta <b>(NOPS)</b><br /><br />
                        <b>- EX</b> = Levy/kansi on hyvässä kunnossa. Vähäisiä käytön jälkiä voi olla levyssä tai kannessa. Osa näistä on lähempänä Mint, mutta varmuuden vuoksi itselläni tämä EX on se paras luokitus jota käytän.<br /><br />
                        <b>- VG</b> = Kannessa enemmän kulumaa tai jälkiä. Levyssä naarmuja, jotka varmastikin kuuluvat enemmän tai vähemmän. Levy kuitenkin ehjä, eikä pitäisi hyppiä tai jäädä paikalleen.<br /><br />
                        <b>- PO</b> = No, tämä nyt on sitten se huonoin luokitus ja tarkoittaa sitä, että naarmuja on jo huomattavasti tai kansi huonossa kunnossa. Levy on ehjä, ei puutu palasia tms, mutta jäljet varmastikin kuuluvat. Mutta näissäkin voi olla positiivisia yllätyksiä (??). Kannessa taasen voi olla repeämiä tai muutenkin huonossa hapessa.
                    </p>
                </div>
                <div className="vertical-line"></div>
                <div className="section">
                    <div className="section">
                        <h2 className="homePageTitles">PoppiMikon ilmoitukset</h2>
                        <div>
                            <p className="homePageParagraph">
                                Tässä osiossa on PoppiMikon uusimmat ilmoitukset. Pysy ajan tasalla uusimmista uutisista ja päivityksistä!
                            </p>
                            <ul className="ulFrontPage">
                                {notifications.map((notif, index) => (
                                    <li key={index}>{notif.notification_text}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="section" style={{ height: "45vh" }}>
                        <h2 className="homePageTitles">PoppiMikon soittolistoja</h2>
                        <div>
                            <h4>Spotify</h4>
                            {renderPlaylists('Spotify')}
                        </div>
                        <div>
                            <h4>Youtube</h4>
                            {renderPlaylists('Youtube')}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default FrontPage;

