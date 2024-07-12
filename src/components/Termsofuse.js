import Footer from "./Footer";
import { useEffect } from "react";

function TermsOfUse() {

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
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
            <Footer />
        </>
    );
}

export default TermsOfUse;
