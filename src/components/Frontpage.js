import * as React from 'react';
import { useState, useEffect } from 'react';
import '../styling/Frontpage.css'
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-material.css';
import { useNavigate } from "react-router-dom";
import Footer from './Footer';
import ImageBanner from './Imagebanner';

import { BASE_URL } from './Apiconstants';

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
        if (records && records.length > 0) {
            const shuffled = records.sort(() => 0.5 - Math.random());
            const selectedRecords = shuffled.slice(0, 10);
            setRandomRecords(selectedRecords);
        } else {
            setRandomRecords([]);
        }
    };

    // Function to render playlists by source
    const renderPlaylists = (source) => {
        if (playlists && playlists.length > 0) {
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
        } else {
            return <p>No playlists available for {source}</p>;
        }
    };

    return (
        <>
            <div className="frontPageMainDiv">
                <h1 className="frontPageTitle">Tervetuloa PoppiMikon levykauppaan</h1>
                <ImageBanner />
                <p style={{ fontSize: 10 }}>HUOM! Bannerin levyt eivät myytävänä.</p>
            </div>
            <div className="contentSection">
                <div className="section">
                    <h2 className="homePageTitles">PoppiMikko</h2>
                    <p className="homePageParagraph">
                        Nimimerkin otin ensimmäistä kertaa käyttöön reilut 10 vuotta sitten, kun aloin latamaan videoita YouTubeen (osa saattaa muistaakin). Kolmen vuoden aikana latasin videoita (lähinnä suomalaisia biisejä) sinne noin 1700, katselukertoja oli yli 20 miljoonaa. Kunnes kanava suljettiin ja kaikki lisäämäni lataukset katosivat sieltä. PoppiMikon rinnalla laitoin sinne myös videoita nimimerkillä PunkMikko, tuo kanava siellä on säilynyt. Tosin aktiivinen en sen kanssa ole ollut vuosikausiin. Sittemmin olen tätä PoppiMikko nimeä siellä täällä käyttänyt, nyt siis myös tällä nettisivulla.
                        <br /><br />
                        <b>Myytävät</b><br />Levyt täällä ovat kaksoiskappaleita tai itselleni turhia, laidasta laitaan kaikenlaista sälää. Yhdelle turha voi olla toisen aarre. Aussi /Alternative -sinkut ovat hyvin edustettuina, kuten myös CD-singlet. LP-osastoa on tässä vaiheessa hieman niukasti, mutta katsotaan, lisäyksiä saattaa olla tulossa myöhemmin. Suurinta osaa on vain yksi kappale, joitain aussi/alternative -sinkkuja voi olla useampikin. Kaikki nämä pitäisi löytyä varastosta, mutta on tänne saattanut jäädä roikkumaan jo aiemmin myyty kohdekin. Hinnoittelussa olen pyrkinyt kohtuullisuuteen ja varmaan suurelta osin siinä onnistunutkin. Lähtökohtana olen käyttänyt Discogsin mediaanihintaa, koska se on varmaan monelle ostajalle sellainen johon voi hieman verrata. Tietenkään se ei ole mikään ehdottomasti "oikea hinta", koska eihän sellaista ole olemassakaan. On vain hinta, jolla levy joko menee kaupaksi tai sitten ei. <b>Minimitilaus on 20 euroa ja vaatii rekisteröitymisen.</b> Levyjä myyn harrastemielessä vapaa-ajalla, joten toimitusaika vaihtelee.
                    </p>
                </div>
                <div className="vertical-line"></div>
                <div className="section">
                    <h2 className="homePageTitles">Nettisivuista</h2>
                    <p className="homePageParagraph">
                        <b>Discogs</b><br />Jokaisella levyllä on Discogsissa oma tunnusnumeronsa. Olen sitä apua käyttäen laittanut lähes kaikkiin kohteisiin suoran linkin kyseiseen levyyn. Voit sitä klikkaamalla levylistassa etsiä levystä lisätietoa ja tarkastaa, mikä painos on kyseessä, minkä värinen vinyyli jne...
                        <br /><br />
                        <b>Banneri</b><br />Levyt, joiden kansia etusivun yläosassa vilistää, <b>eivät ole myynnissä.</b> Ne ovat siellä, koska ne ovat muistoja PoppiMikko ja PunkMikko -postauksista YouTubeen. Ja ovathan ne visuaalisesti hyvän näköisiä, eikö vain. Klikkaamalla kuvaa saat sen isoksi.
                        <br /><br />
                        <b>Mobiililaitteella käyttö</b><br />Sivustoa on parhaan mukaan koitettu optimoida myös mobiililaitteilla toimivaksi, mutta parannettavaa varmasti on, vähintään levylistan selaaminen on vaikeampaa mobiililaitteella.
                        <br /><br />
                        <b>Maksutavat</b><br />Sivusto ei tällä hetkellä tue suoraa maksujärjestelmää, joten maksamiseen on kolme vaihtoehtoa: MobilePay, tilisiirto tai käteinen noudon yhteydessä. Tilausta tehdessäsi pääset valitsemaan maksutavan.
                        <br /><br />
                        <b>Postikulut</b><br />Lisätään, jos ei ole nouto Vuosaaresta. Jos tilauksessa on yksikin LP, MLP, 12", MAGAZINE, BOOK, DVD niin silloin kyseessä on paketti ja postikulut ovat <b>9 euroa.</b> Muissa tapauksissa postikulut ovat <b>5 euroa.</b> Huomioithan hinnanlisäyksen tilausta tehdessäsi.
                        <br /><br />
                        <b>Chatti</b><br />Tarkoitettu tilauksen tekemisen jälkeen asioiden sopimiseen, esimerkiksi sopiminen noudosta. Chatti on tarkoitettu vain tilausten hoitoon, joten jätetään muut keskustelut toiselle somealustalle. Jos chatin kanssa ongelmia, koita <b>päivittää sivu (F5).</b>
                        <br /><br />
                        <b>Ilmoitustaulu</b><br />Ilmoitustaulu sijaitsee oikeassa reunassa ja sinne tulee tietoa, jos olen lisännyt levyjä tai milloin olen "lomalla" eli kauppa on kiinni. Tai ihan mitä tahansa, mitä mieleen tulee.
                        <br /><br />
                        <b>Soittolistat</b><br />Koottu valikoidusti biisejä, joita täällä on myynnissä. Sivun oikeasta reunasta löytyy suorat linkit niihin. Voit käydä sieltä hakemassa vinkkejä tai muuten vaan kuuntelemassa hyvää (?) musaa.
                        <br /><br />
                        <b>Virheitä</b><br />Niitä sivustolta mahdollisesti voi löytyä. Kirjoitus- ja asiavirheitä ja ennen kaikkea noiden Discogs numeroiden kanssa. Olen pyrkinyt kaikessa mahdollisimman suureen tarkkuuteen, mutta silti. Jos tuo Discogs-linkki menee johonkin ihan väärään levyyn, niin ilmoita siitä. Sivustolla voi ilmetä bugeja ja toiminnallisia virheitä. Niistä voi rekisteröityneenä käyttäjänä ilmoittaa "Lähetä palautetta" -osiosta.
                    </p>
                </div>
                <div className="vertical-line"></div>
                <div className="section">
                    <h2 className="homePageTitles">Levyjen kunto</h2>
                    <p className="homePageParagraph">
                        Kunnot on arvioitu pääosin vain visuaalisesti. Ensimmäinen sarake on levy <b>(Rec),</b> toinen kansi <b>(PS).</b> Jos se on tyhjä, niin ei kantta <b>(NOPS).</b> CD ja CDs kannen kuntoluokituksessa olen katsonut paperisen sisäosan kuntoa, enkä muovikannen kuntoa, kun se on vaihdettavissa.
                        <br /><br />
                        <b>EX</b> = Levy/kansi on hyvässä kunnossa. Vähäisiä käytön jälkiä voi olla levyssä tai kannessa kulumaa. Osa näistä on lähempänä Mint, varsinkin suurin osa noista aussi/alternative -sinkuista, mutta varmuuden vuoksi itselläni tämä EX on se paras luokitus jota käytän.
                        <br /><br />
                        <b>VG</b> = Kannessa enemmän kulumaa tai jälkiä. Levyssä pieniä naarmuja, jotka varmastikin kuuluvat enemmän tai vähemmän. Levy kuitenkin ehjä, eikä pitäisi hyppiä tai jäädä paikalleen.
                        <br /><br />
                        <b>PO</b> = No, tämä nyt on sitten se huonoin luokitus ja tarkoittaa sitä, että naarmuja on jo huomattavasti tai kansi huonossa kunnossa. Levy on ehjä, ei puutu palasia tms, mutta jäljet varmastikin kuuluvat. Kannessa taasen voi olla pieniä repeämiä tai muuten huonossa hapessa. Mutta näissäkin voi olla positiivisia yllätyksiä (??).
                        <br /><br />
                        <b>WOC / WOL</b> = writing on cover / label
                        <br />
                        <b>SOC / SOL</b> = sticker (tarra/hintalappu) on cover / label
                        <br />
                        <b>TOC / TOL</b> = tear (pieni repeämä) on cover / label
                        <br /><br />
                        Joskus olen unohtanut näitä merkitä, mutta aina olen sen huomioinut kuntoarviossa ja hinnassa.
                    </p>
                    <h2 className="homePageTitles">Genret</h2>
                    <p className="genreNSizeFormatter">
                        <span className="formatItem">
                            <b className="formatLabel">Australia</b> – tämä on tietystä syystä laitettu erikseen
                        </span>
                        <span className="formatItem">
                            <b className="formatLabel">Alter (=Alternative)</b> – Punk/Indie/Grunge (1982 - )
                        </span>
                        <span className="formatItem">
                            <b className="formatLabel">Punk/New W (=New Wave)</b> - pääosin (1977-1984)
                        </span>
                        <span className="formatItem">
                            <b className="formatLabel">Roots</b> – Blues/Country/Jazz jne.
                        </span>
                        <span className="formatItem">
                            <b className="formatLabel">Rock/Pop</b> – kaikki ulkomainen, jota ei noissa ylemmissä
                        </span>
                        <span className="formatItem">
                            <b className="formatLabel">Suomi</b> – kaikki suomalaiset. Rock/Pop/Punk/Iskelmä jne.
                        </span>
                        <span className="formatItem">
                            <b className="formatLabel">Magazine</b> – lehdet
                        </span>
                        <span className="formatItem">
                            <b className="formatLabel">Book</b> – kirjat
                        </span>
                        <span className="formatItem">
                            <b className="formatLabel">DVD</b>
                        </span>
                        <span className="formatItem">
                            <b className="formatLabel">Sekalaiset</b> – mitä tahansa muuta, mitä ei mainittu yllä.
                        </span>
                    </p>

                    <h2 className="homePageTitles">Koko eli Size</h2>
                    <p className="genreNSizeFormatter">
                        <span className="formatItem">
                            <b className="formatLabel">7"</b> – ne perinteiset singlet ja EP:t
                        </span>
                        <span className="formatItem">
                            <b className="formatLabel">LP</b> – ne perinteiset albumit (12")
                        </span>
                        <span className="formatItem">
                            <b className="formatLabel">MLP</b> – mini-LP, kuin albumi (12") mutta vähemmän biisejä
                        </span>
                        <span className="formatItem">
                            <b className="formatLabel">12"</b> – maxisinglet (yleensä 1-3 biisiä / puoli)
                        </span>
                        <span className="formatItem">
                            <b className="formatLabel">10"</b> – maxisingle tai mini-LP
                        </span>
                        <span className="formatItem">
                            <b className="formatLabel">CD</b> – täyspitkä levy
                        </span>
                        <span className="formatItem">
                            <b className="formatLabel">CDs</b> – CD-single
                        </span>
                    </p>
                </div>
                <div className="vertical-line"></div>
                <div className="section">
                    <div className="section">
                        <h2 className="homePageTitles">Ilmoitustaulu</h2>
                        <ul className="ulFrontPage">
                            {notifications && notifications.length > 0 ? (
                                notifications.slice().reverse().map((notif, index) => (
                                    <li key={index}>
                                        <p>{notif.notification_text}</p>
                                        <span className="notification-time">Julkaistu: {new Date(notif.created_at).toLocaleString()}</span>
                                    </li>
                                ))
                            ) : (
                                <li>No notifications available</li>
                            )}
                        </ul>
                    </div>
                    <div className="section" style={{ height: "45vh" }}>
                        <h2 className="homePageTitles">Soittolistoja</h2>
                        <div>
                            <h2>Spotify</h2>
                            {renderPlaylists('Spotify')}
                        </div>
                        <div>
                            <h2>Youtube</h2>
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

