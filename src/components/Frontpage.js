import * as React from 'react';
import '../styling/Frontpage.css'

function FrontPage() {
    return (
        <>
            <div className="frontPageMainDiv">
                <h1>Tervetuloa PoppiMikon levykauppaan</h1>
                <p>Alta löydät hieman ohjeistusta levyjen ostoon liittyen</p>
            </div>
            <div>
                <h2 className="homePageTitles">Hinnoittelu</h2>

                <p className="homePageParagraph">Lähtökohtana olen käyttänyt Discogsin mediaanihintaa. Osa näistä levyistä on huomattavan hyvässä kunnossa, jolloin olen laittanut hinnan hieman ylemmäksi. Muutamassa tapauksessa jopa selvästi korkeammaksi. Mutta jokaine hintahan on ostajan harkittavissa ja koska tällä kertaa myyn pakon edessä omia levyjäni, niin <b><u>EI ALENNUKSIA !!!</u></b> eli jos olet ostamassa, niin älä laske budjettiasi alennusten varaan. Tämä on selkeä pelin henki (SORRY !!!) ja koskee kaikkia.</p>

                <h2 className="homePageTitles">Discogs numero</h2>
                <p className="homePageParagraph">Jokaisella levyllä tuolla Discogsissa on oma numeronsa, joka löytyy joka kohteen kohdalla. Aiemmin kun olen näitä levyjä myynyt, niin usein kysytään, että mikä painos. Nyt pystyt itse tsekkaamaan asian klikkaamalla levyn discogs numeroa levylistassa, niin pääset suoraan levyn discogs-sivulle. </p>

                <h2 className="homePageTitles">Levyjen kunto</h2>
                <p className="homePageParagraph">Kunnot on arvioitu pääosin vain visuaalisesti. Ensimmäinen sarake on levy <b>(Rec)</b>, toinen kansi <b>(PS)</b>. Jos se on tyhjä, niin ei kantta <b>(NOPS)</b><br></br><br></br>

                    <b>- EX</b> = Levy/kansi on hyvässä kunnossa. Vähäisiä käytön jälkiä voi olla levyssä tai kannessa. Osa näistä on lähempänä Mint, mutta varmuuden vuoksi itselläni tämä EX on se paras luokitus jota käytän.<br></br><br></br>

                    <b>- VG</b> = Kannessa enemmän kulumaa tai jälkiä. Levyssä naarmuja, jotka varmastikin kuuluvat enemmän tai vähemmän. Levy kuitenkin ehjä, eikä pitäisi hyppiä tai jäädä paikalleen.<br></br><br></br>

                    <b>- PO</b> = No, tämä nyt on sitten se huonoin luokitus ja tarkoittaa sitä, että naarmuja on jo huomattavasti tai kansi huonossa kunnossa. Levy on 	ehjä, ei puutu palasia tms , mutta jäljet varmastikin kuuluvat. Mutta näissäkin voi olla positiivisia yllätyksiä (??). Kannessa taasen voi olla repeämiä tai muutenkin huonossa hapessa. </p>
            </div>
        </>
    )
}

export default FrontPage;

