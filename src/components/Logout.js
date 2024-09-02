import { Button } from '@mui/material';
import { useNavigate } from "react-router-dom";
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
import '../styling/Logout.css';

function Logout({ setIsLoggedIn, setLoggedInUser, setNewMessageState, handleLogout }) {
    const navigate = useNavigate();

    const handleLogoutAndNavigate = () => {
        handleLogout(() => {
            navigate("/");
        });
    };

    return (
        <div className="logoutDiv" onClick={() => handleLogoutAndNavigate()}>
            <span style={{ color: "white" }}>Kirjaudu ulos</span><IconButton
                style={{ marginLeft: 10, color: "white" }}  
            >
                <LogoutIcon />
            </IconButton>
        </div>
    )
}

export default Logout;
