import { Button } from '@mui/material';
import { useNavigate } from "react-router-dom";
import IconButton from '@mui/material/IconButton';
import LogoutIcon from '@mui/icons-material/Logout';
import '../styling/Logout.css';


function Logout({ setIsLoggedIn, setLoggedInUser }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        // This is to help clear everything but the unmountTime that comes when last visited chat, to keep track of new messages.
        const timeStampKeeperKey = "unmountTime";
        const timeStampKeeper = localStorage.getItem("unmountTime")

        setIsLoggedIn(false);
        setLoggedInUser({
            email: "",
            role: "",
            id: null,
            token: null
        });
        localStorage.clear();

        if (timeStampKeeper !== null) {
            localStorage.setItem(timeStampKeeperKey, timeStampKeeper);
        }
        navigate("/");
    }

    return (
        <div className="logoutDiv" onClick={() => handleLogout()}>
            <span style={{ color: "white" }}>Kirjaudu ulos</span><IconButton
                style={{ marginLeft: 10, color: "white" }}  
            >
                <LogoutIcon />
            </IconButton>
        </div>
    )
}

export default Logout;
