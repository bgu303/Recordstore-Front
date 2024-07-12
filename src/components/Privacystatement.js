import Footer from "./Footer";
import { useEffect } from "react";

function PrivacyStatement() {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
                <h3 style={{ borderBottom: "2px solid #333", paddingBottom: "10px" }}>Tietosuojaseloste</h3>
                <p style={{ fontSize: "14px", color: "#666" }}>Viimeksi päivitetty: 12. heinäkuuta 2024</p>

                <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ marginTop: "20px", marginBottom: "10px", borderBottom: "1px solid #ccc", paddingBottom: "5px" }}>Rekisterinpitäjä</h4>
                    <p>PoppiMikon levykauppa<br />Sähköposti: mivesstore@gmail.com</p>
                </div>
                <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ marginTop: "20px", marginBottom: "10px", borderBottom: "1px solid #ccc", paddingBottom: "5px" }}>Henkilötietojen käsittelyn tarkoitus</h4>
                    <p>Käsittelemme henkilötietoja seuraaviin tarkoituksiin:<br />
                        - Asiakassuhteen hoitaminen<br />
                        - Tilauksen toimitus ja laskutus<br />
                        - Markkinointi ja asiakasviestintä<br />
                        - Verkkopalvelun kehittäminen ja turvallisuus</p>
                </div>
                <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ marginTop: "20px", marginBottom: "10px", borderBottom: "1px solid #ccc", paddingBottom: "5px" }}>Rekisteröidyt ja kerättävät henkilötiedot</h4>
                    <p>Keräämme ja käsittelemme seuraavia henkilötietoja:<br />
                        - Nimi, osoite ja yhteystiedot<br />
                        - Tilaukseen liittyvät tiedot (tuotteet, maksutiedot)<br />
                        - Asiakasviestinnän ja markkinoinnin suostumukset</p>
                </div>
                <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ marginTop: "20px", marginBottom: "10px", borderBottom: "1px solid #ccc", paddingBottom: "5px" }}>Henkilötietojen säilytysaika</h4>
                    <p>Säilytämme henkilötietoja niin kauan kuin se on tarpeen edellä mainittujen tarkoitusten toteuttamiseksi tai lakisääteisten velvoitteiden täyttämiseksi.</p>
                </div>
                <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ marginTop: "20px", marginBottom: "10px", borderBottom: "1px solid #ccc", paddingBottom: "5px" }}>Henkilötietojen suojaaminen</h4>
                    <p>Henkilötiedot säilytetään luottamuksellisina ja niitä käsitellään tietoturvallisesti. Käytämme asianmukaisia teknisiä ja organisatorisia toimenpiteitä tietojen suojaamiseksi luvattomalta pääsyltä ja muulta tietojen väärinkäytöltä.</p>
                </div>
                <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ marginTop: "20px", marginBottom: "10px", borderBottom: "1px solid #ccc", paddingBottom: "5px" }}>Oikeutesi</h4>
                    <p>Sinulla on oikeus pyytää pääsyä omiin henkilötietoihisi, oikaista niitä, poistaa ne tai rajoittaa niiden käsittelyä. Voit myös milloin tahansa peruuttaa suostumuksesi tietojen käsittelyyn, vastustaa tietojen käsittelyä ja pyytää tietojen siirtoa toiselle rekisterinpitäjälle.</p>
                </div>
                <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ marginTop: "20px", marginBottom: "10px", borderBottom: "1px solid #ccc", paddingBottom: "5px" }}>Yhteystiedot</h4>
                    <p>Jos sinulla on kysyttävää tietosuojaselosteestamme, ota meihin yhteyttä:</p>
                    <ul>
                        <li>Sähköposti: mivesstore@gmail.com</li>
                    </ul>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default PrivacyStatement;
