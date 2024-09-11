import * as React from 'react';
import { useState } from 'react';
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-material.css';
import { Button } from '@mui/material';
import TextField from '@mui/material/TextField';
import '../styling/Createuser.css';
import { useNavigate } from 'react-router-dom';

import { BASE_URL, BASE_URL_CLOUD } from './Apiconstants';

function CreateUser() {
    const [user, setUser] = useState({
        email: "",
        confirmEmail: "",
        password: "",
        name: "",
        nickName: "",
        confirmPassword: "",
        role: "USER"
    })
    const [termsOfUseOpen, setTermsOfUseOpen] = useState(false);

    const navigate = useNavigate();

    const createUser = async () => {
        if (user.email.trim() === "" || user.password.trim() === "" || user.confirmPassword === "" || user.name === "" || user.nickName === "") {
            return alert("Täytä kaikki kentät.");
        }

        if (user.name.length >= 70) {
            return alert("Käytä lyhyempää nimeä.");
        }

        if (user.name.length >= 16) {
            return alert("Käytä lyhyempää nimimerkkiä.");
        }

        if (user.email.length >= 50) {
            return alert("Käytä lyhyempää sähköpostiosoitetta.");
        }

        if (user.password !== user.confirmPassword) {
            return alert("Salasanat eivät ole samat");
        }

        if (user.confirmEmail !== user.email) {
            return alert("Sähköpostit eivät täsmää.");
        }

        // Uncomment these checks when testing phase is over.
        /* 
        if (user.password.length < 9) {
            return alert("Salasanan tulee olla vähintään 9 merkkiä pitkä.");
        }
        
        if (!/[A-Z]/.test(user.password)) {
            return alert("Salasanassa tulee olla vähintään yksi iso kirjain.");
        }
        
        if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(user.email)) {
            return alert("Syötä kelvollinen sähköpostiosoite.");
        }
        */

        try {
            const response = await fetch(`${BASE_URL_CLOUD}/user/createuser`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    email: user.email,
                    password: user.password,
                    role: user.role,
                    name: user.name,
                    nickName: user.nickName
                })
            });

            if (!response.ok) {
                if (response.status === 409) {
                    return alert("Sähköposti on jo käytössä.");
                }
                alert("Jokin meni vikaan käyttäjää luodessa.");
            } else {
                setUser({
                    email: "",
                    password: "",
                    confirmPassword: "",
                    role: "USER"
                });
                alert("Käyttäjä luotu!");
                navigate("/login");
            }
        } catch (error) {
            console.log(`Error in creating user: ${error}`);
            alert("Jokin meni vikaan käyttäjää luodessa.");
        }
    }

    //If user presses enter key on either TextField -> tries to create user.
    const handleKeyPress = (e) => {
        if (e.keyCode === 13) {
            createUser();
        }
    }

    const goToTermsAndServices = () => {
        setTermsOfUseOpen(prevState => !prevState);
    };

    return (
        <>
            <div className="mainDiv">
                <h3>Luo Käyttäjä</h3>
                <div>
                    <label style={{ fontWeight: "bold", display: "block", marginBottom: 10 }}>Sähköposti*</label>
                    <TextField
                        label="Sähköposti"
                        size="small"
                        onChange={e => setUser({ ...user, email: e.target.value })}
                        value={user.email}
                        onKeyDown={handleKeyPress}
                        style={{ backgroundColor: "white", borderRadius: 10 }}
                    />
                </div>
                <div>
                    <label style={{ fontWeight: "bold", display: "block", marginBottom: 10 }}>Sähköposti uudelleen*</label>
                    <TextField
                        label="Sähköposti uudelleen"
                        size="small"
                        onChange={e => setUser({ ...user, confirmEmail: e.target.value })}
                        value={user.confirmEmail}
                        onKeyDown={handleKeyPress}
                        style={{ backgroundColor: "white", borderRadius: 10 }}
                    />
                </div>
                <div>
                    <label style={{ fontWeight: "bold", display: "block", marginBottom: 10 }}>Etu- ja Sukunimi*</label>
                    <TextField
                        label="Etu- ja sukunimi"
                        size="small"
                        onChange={e => setUser({ ...user, name: e.target.value })}
                        value={user.name}
                        onKeyDown={handleKeyPress}
                        style={{ backgroundColor: "white", borderRadius: 10 }}
                    />
                </div>
                <div>
                    <label style={{ fontWeight: "bold", display: "block", marginBottom: 10 }}>Nimimerkki*</label>
                    <TextField
                        label="Nimimerkki"
                        size="small"
                        onChange={e => setUser({ ...user, nickName: e.target.value })}
                        value={user.nickName}
                        onKeyDown={handleKeyPress}
                        style={{ backgroundColor: "white", borderRadius: 10 }}
                    />
                </div>
                <div>
                    <label style={{ fontWeight: "bold", display: "block", marginBottom: 10 }}>Salasana*</label>
                    <TextField
                        label="Salasana"
                        size="small"
                        type="password"
                        onChange={e => setUser({ ...user, password: e.target.value })}
                        value={user.password}
                        onKeyDown={handleKeyPress}
                        style={{ backgroundColor: "white", borderRadius: 10 }}
                    />
                </div>
                <div>
                    <label style={{ fontWeight: "bold", display: "block", marginBottom: 10 }}>Salasana uudelleen*</label>
                    <TextField
                        label="Salasana uudelleen"
                        size="small"
                        type="password"
                        onChange={e => setUser({ ...user, confirmPassword: e.target.value })}
                        value={user.confirmPassword}
                        onKeyDown={handleKeyPress}
                        style={{ backgroundColor: "white", borderRadius: 10 }}
                    />
                </div>
                <div style={{ marginTop: 10, textAlign: "center" }}>
                    <p style={{ marginBottom: 10 }}>Salasanassa tulee olla vähintään 9 merkkiä ja iso merkki.</p>
                    <p style={{ marginBottom: 10 }}>Sähköposti, etu- ja sukunimi <b>vain PoppiMikon</b> nähtävissä.</p>
                    <p style={{ marginBottom: 10 }}>Nimimerkki kaikkien nähtävissä yleisessä Chatissä.</p>
                </div>
                <Button color="success" variant="contained" style={{ borderRadius: "15px", marginTop: "10px" }} onClick={() => createUser()}>Luo käyttäjä</Button>
                <p style={{ textAlign: "center" }}>Luomalla käyttäjän hyväksyt <span style={{ cursor: "pointer", color: "purple", fontWeight: "bold" }} onClick={() => goToTermsAndServices()}>Käyttöehdot.</span></p>
                {termsOfUseOpen && (<div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                    <div style={{ flex: "1", padding: "20px", maxWidth: "800px", margin: "auto" }}>
                        <h3 style={{ borderBottom: "2px solid #333", paddingBottom: "10px" }}>Käyttöehdot</h3>
                        <p style={{ fontSize: "14px", color: "#666" }}>Viimeksi päivitetty: 12. heinäkuuta 2024</p>

                        <div style={{ marginBottom: "20px" }}>
                            <p>Tervetuloa käyttämään palveluamme. Näitä käyttöehtoja sovelletaan kaikkiin palveluihimme. Käyttämällä palveluamme hyväksyt nämä ehdot kokonaisuudessaan.</p>
                        </div>
                        <div style={{ marginBottom: "20px" }}>
                            <h4 style={{ marginTop: "20px", marginBottom: "10px", borderBottom: "1px solid #ccc", paddingBottom: "5px" }}>Palvelun käyttö</h4>
                            <p>Sitoudut käyttämään palveluamme vain laillisiin tarkoituksiin ja noudattamaan kaikkia soveltuvia lakeja ja sääntöjä. Et saa käyttää palvelua tavalla, joka voisi vahingoittaa palvelua tai sen saatavuutta, eikä tavalla, joka on laiton, petollinen tai vahingollinen.</p>
                        </div>
                        <div style={{ marginBottom: "20px" }}>
                            <h4 style={{ marginTop: "20px", marginBottom: "10px", borderBottom: "1px solid #ccc", paddingBottom: "5px" }}>Immateriaalioikeudet</h4>
                            <p>Ellei toisin mainita, me tai lisenssinantajamme omistamme kaikki immateriaalioikeudet palvelussa ja sen materiaalissa. Kaikki nämä immateriaalioikeudet pidätetään.</p>
                        </div>
                        <div style={{ marginBottom: "20px" }}>
                            <h4 style={{ marginTop: "20px", marginBottom: "10px", borderBottom: "1px solid #ccc", paddingBottom: "5px" }}>Käyttäjien tuottama sisältö</h4>
                            <p>Olet vastuussa kaikesta sisällöstä, jonka lähetät tai lataat palveluun. Et saa lähettää mitään sisältöä, joka on laitonta, uhkaavaa, herjaavaa, halventavaa, säädytöntä, pornografiaa sisältävää tai muuten sopimatonta.</p>
                        </div>
                        <div style={{ marginBottom: "20px" }}>
                            <h4 style={{ marginTop: "20px", marginBottom: "10px", borderBottom: "1px solid #ccc", paddingBottom: "5px" }}>Vastuun rajoitus</h4>
                            <p>Palvelumme tarjotaan "sellaisena kuin se on" ja "saatavilla olevana" -pohjalta. Emme takaa, että palvelu on virheetön, keskeytyksetön tai turvallinen. Emme ole vastuussa mistään suorista, epäsuorista, satunnaisista, erityisistä tai välillisistä vahingoista, jotka johtuvat palvelun käytöstä tai kyvyttömyydestä käyttää palvelua.</p>
                        </div>
                        <div style={{ marginBottom: "20px" }}>
                            <h4 style={{ marginTop: "20px", marginBottom: "10px", borderBottom: "1px solid #ccc", paddingBottom: "5px" }}>Muutokset käyttöehtoihin</h4>
                            <p>Voimme päivittää näitä käyttöehtoja ajoittain. Päivitetyt ehdot tulevat voimaan heti, kun ne on julkaistu tällä sivulla. On sinun vastuullasi tarkistaa nämä ehdot säännöllisesti.</p>
                        </div>
                        <div style={{ marginBottom: "20px" }}>
                            <h4 style={{ marginTop: "20px", marginBottom: "10px", borderBottom: "1px solid #ccc", paddingBottom: "5px" }}>Yhteystiedot</h4>
                            <p>Jos sinulla on kysyttävää näistä käyttöehdoista, ota meihin yhteyttä:</p>
                            <ul>
                                <li>Sähköposti: mivesstore@gmail.com</li>
                            </ul>
                        </div>
                    </div>
                </div>)}
            </div>
        </>
    )
}

export default CreateUser;