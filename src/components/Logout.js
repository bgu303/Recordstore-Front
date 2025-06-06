import { Button } from '@mui/material';
import { useNavigate } from "react-router-dom";
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
import '../styling/Logout.css';

function Logout({ loggedInUser, handleLogout }) {
    const navigate = useNavigate();

    const handleLogoutAndNavigate = () => {
        handleLogout(() => {
            navigate("/");
        });
    };

    return (
        <div className="logoutDiv">
            <span style={{ color: "white" }} onClick={() => handleLogoutAndNavigate()}>Kirjaudu ulos</span><IconButton
                style={{ marginLeft: 10, color: "white" }}
                onClick={() => handleLogoutAndNavigate()}
            >
                <LogoutIcon/>
            </IconButton>
        </div>
    )
}

export default Logout;
