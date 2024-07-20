import * as React from 'react';
import '../styling/Frontpage.css'
import { useNavigate } from "react-router-dom";


function Footer() {

    const navigate = useNavigate();
    const toLinkedIn = () => {
        window.open("https://www.linkedin.com/in/jukka-vesanto/", "_blank");
    }

    const goToTermsOfUse = () => {
        navigate("/termsofuse")
    }

    const goToPrivacyStatement = () => {
        navigate("/privacystatement")
    }

    return (
        <div>
            <footer>
                <div className="frontPageClickable" onClick={() => goToTermsOfUse()}>Käyttöehdot</div>
                <div className="frontPageClickable" onClick={() => goToPrivacyStatement()}>Tietosuojaseloste</div>
                <div>PoppiMikko ©2024. All Rights Reserved.</div>
                <div>Made with ❤ By <span style={{ cursor: "pointer", fontWeight: "bold", color: "#DDA0DD" }} onClick={() => toLinkedIn()}>Jukka Vesanto</span></div>
            </footer>
        </div>
    )
}

export default Footer;