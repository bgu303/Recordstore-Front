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
                    <h2 className="homePageTitles" style={{ color: "white" }}>&#8203;</h2>
                    <p className="homePageParagraph">
                        <b>PoppiMikko</b> nimimerkin otin ensimmäistä kertaa käyttöön reilut 10 vuotta sitten, kun aloin latamaan videoita YouTubeen (osa saattaa muistaakin). Kolmen vuoden aikana latasin videoita (lähinnä suomalaisia biisejä) sinne noin 1700, katselukertoja oli yli 20 miljoonaa. Kunnes kanava suljettiin ja kaikki katosivat sieltä. PoppiMikon rinnalla laitoin sinne myös videoita nimimerkillä PunkMikko, tuo kanava siellä on säilynyt. Tosin aktiivinen en sen kanssa ole ollut vuosikausiin. Sittemmin olen tätä PoppiMikko nimeä siellä täällä käyttänyt, nyt siis myös tällä nettisivulla.
                        <br /><br />
                        <b>Myytävät</b> levyt täällä ovat kaksoiskappaleita tai itselleni turhia, laidasta laitaan kaikenlaista sälää. Yhdelle turha voi olla toisen aarre. Aussi /Alternative -sinkut ovat hyvin edustettuina, kuten myös CD-singlet. LP-osastoa on tässä vaiheessa hieman niukasti, mutta katsotaan, lisäyksiä saattaa olla tulossa myöhemmin. Suurinta osaa on vain yksi kappale, joitain aussi/alternative -sinkkuja voi olla useampikin. Kaikki nämä pitäisi löytyä varastosta, mutta on tänne saattanut jäädä roikkumaan jo aiemmin myyty kohdekin. Hinnoittelussa olen pyrkinyt kohtuullisuuteen ja varmaan suurelta osin siinä onnistunutkin. Lähtökohtana olen käyttänyt Discogsin mediaanihintaa, koska se on varmaan monelle ostajalle sellainen johon voi hieman verrata. Tietenkään se ei ole mikään ehdottomasti "oikea hinta", koska eihän sellaista ole olemassakaan. On vain hinta, jolla levy joko menee kaupaksi tai sitten ei. <b>Minimitilaus on 20 euroa ja vaatii rekisteröitymisen.</b>
                    </p>
                </div>
                <div className="vertical-line"></div>
                <div className="section">
                    <h2 className="homePageTitles" style={{ color: "white" }}>&#8203;</h2>
                    <p className="homePageParagraph">
                        <b>Discogs.</b> Jokaisella levyllä on Discogsissa oma tunnusnumeronsa. Olen sitä apua käyttäen laittanut lähes kaikkiin kohteisiin suoran linkin kyseiseen levyyn. Voit sitä klikkaamalla levylistassa etsiä levystä lisätietoa ja tarkastaa, mikä painos on kyseessä, minkä värinen vinyyli jne...
                        <br /><br />
                        <b>Bannerin</b> levyt, joiden kansia etusivun yläosassa vilistää, <b>eivät ole myynnissä.</b> Ne ovat siellä, koska ne ovat muistoja PoppiMikko ja PunkMikko -postauksista YouTubeen. Ja ovathan ne visuaalisesti hyvän näköisiä, eikö vain. Klikkaamalla kuvaa saat sen isoksi.
                        <br /><br />
                        <b>Postikulut</b> siis lisätään, jos ei ole nouto. En laittanut hintaa tuonne ostoskoriin, sillä se vaihtelee. Jos tilauksessa on yksikin LP, niin silloin kyseessä on paketti ja hinta on 8,90 (tämän hetken hinnastossa). Mutta sinkku tai pari, CD tai pari … ne saa tulemaan kirjeenä, jolloin hinta on halvempi. Eli tapauskohtainen.
                        <br /><br />
                        <b>Chatti</b> on tarkoitettu tilausten jälkeen asioiden sopimiseen. Sivut eivät tällä hetkellä tue suoraa maksujärjestelmää, joten mahdolliset postikulut ja noudoista sopiminen tehdään Chatin kautta. Chatti on tarkoitettu vain tilausten hoitoon, joten jätetään muut keskustelut toiselle somealustalle.
                        <br /><br />
                        <b>Ilmoitustaulu</b> etusivun oikeassa reunassa on mitä nimi sanookin. Laitan sinne tietoa, jos olen lisännyt levyjä tai milloin olen "lomalla" eli kauppa on kiinni. Tai ihan mitä tahansa mitä mieleen tulee.
                        <br /><br />
                        <b>Soittolistoille</b> on koottu valikoidusti biisejä, joita täällä on myynnissä. Sivun oikeasta reunasta löytyy suorat linkit niihin. Voit käydä sieltä hakemassa vinkkejä tai muuten vaan kuuntelemassa hyvää (?) musaa.
                        <br /><br />
                        <b>Virheitä</b> täällä varmasti on. Kirjoitus- ja asiavirheitä ja ennen kaikkea noiden Discogs numeroiden kanssa. Olen pyrkinyt kaikessa mahdollisimman suureen tarkkuuteen, mutta silti. Jos tuo Discogs-linkki menee johonkin ihan väärään levyyn, niin ilmoita siitä. Sivustolla voi ilmetä bugeja ja toiminnallisia virheitä. Niistä voi rekisteröityneenä käyttäjänä ilmoittaa "Lähetä palautetta" -osiosta.
                    </p>
                </div>
                <div className="vertical-line"></div>
                <div className="section">
                    <h2 className="homePageTitles">Levyjen kunto</h2>
                    <p className="homePageParagraph">
                        Kunnot on arvioitu pääosin vain visuaalisesti. Ensimmäinen sarake on levy <b>(Rec),</b> toinen kansi <b>(PS).</b> Jos se on tyhjä, niin ei kantta <b>(NOPS).</b>
                        <br /><br />
                        - <b>EX</b> = Levy/kansi on hyvässä kunnossa. Vähäisiä käytön jälkiä voi olla levyssä tai kannessa kulumaa. Osa näistä on lähempänä Mint, varsinkin suurin osa noista aussi/alternative -sinkuista, mutta varmuuden vuoksi itselläni tämä EX on se paras luokitus jota käytän.
                        <br /><br />
                        - <b>VG</b> = Kannessa enemmän kulumaa tai jälkiä. Levyssä pieniä naarmuja, jotka varmastikin kuuluvat enemmän tai vähemmän. Levy kuitenkin ehjä, eikä pitäisi hyppiä tai jäädä paikalleen.
                        <br /><br />
                        - <b>PO</b> = No, tämä nyt on sitten se huonoin luokitus ja tarkoittaa sitä, että naarmuja on jo huomattavasti tai kansi huonossa kunnossa. Levy on ehjä, ei puutu palasia tms, mutta jäljet varmastikin kuuluvat. Kannessa taasen voi olla pieniä repeämiä tai muuten huonossa hapessa. Mutta näissäkin voi olla positiivisia yllätyksiä (??).
                        <br /><br />
                        - <b>WOC / WOL</b> = writing on cover / label
                        <br /><br />
                        - <b>SOC / SOL</b> = sticker (tarra/hintalappu) on cover / label
                        <br /><br />
                        - <b>TOC / TOL</b> = tear (pieni repeämä) on cover / label
                        <br /><br />
                        joskus olen unohtanut näitä merkitä, mutta aina olen sen huomioinut kuntoarviossa ja hinnassa.
                    </p>
                    <h2 className="homePageTitles">Genret</h2>
                    <p className="homePageParagraph">
                        - <b>Australia</b> – tämä on tietystä syystä laitettu erikseen
                        <br /><br />
                        - <b>Alter (=Alternative)</b> – Punk/Indie/Grunge/Noise (enimmäkseen 1982 eteenpäin)
                        <br /><br />
                        - <b>Punk/New Wave</b> – Punk/Indie/osin Pop (enimmäkseen 1977-1982)
                        <br /><br />
                        - <b>Roots</b> – Blues/Country/Jazz jne.
                        <br /><br />
                        - <b>Rock/Pop</b> – kaikki ulkomainen, jota ei noissa ylemmissä
                        <br /><br />
                        - <b>Suomi</b> – kaikki suomalaiset. Rock/Pop/Punk/Iskelmä/Viihde jne.
                        <br /><br />
                        - <b>Magazine</b> – lehdet
                        <br /><br />
                        - <b>Books</b> – kirjat
                        <br /><br />
                        - <b>DVD</b>
                        <br /><br />
                        - <b>Sekalaiset</b> – ihan mitä tahansa muuta, mitä ei mainittu yllä.
                    </p>
                    <h2 className="homePageTitles">Koko eli Size</h2>
                    <p className="homePageParagraph">
                        - <b>7"</b> – ne perinteiset singlet ja EP:t
                        <br /><br />
                        - <b>LP</b> – ne perinteiset albumit (12")
                        <br /><br />
                        - <b>MLP</b> – mini-LP, albumin kokoinen (12") mutta vähemmän biisejä
                        <br /><br />
                        - <b>12"</b> – maxisinglet (yleensä 1-3 biisiä / puoli)
                        <br /><br />
                        - <b>10"</b> – maxisingle tai mini-LP
                        <br /><br />
                        - <b>CD</b> – täyspitkä levy
                        <br /><br />
                        - <b>Cds</b> – CD-single
                    </p>

                </div>
                <div className="vertical-line"></div>
                <div className="section">
                    <div className="section">
                        <h2 className="homePageTitles">Ilmoitustaulu</h2>
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

