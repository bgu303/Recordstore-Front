import { Button } from '@mui/material';
import { useNavigate } from "react-router-dom";

function Logout({ setIsLoggedIn, setLoggedInUser }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        //This is to help clear everything but the unmountTime that comes when last visited chat, to keep track of new messages.
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
        <Button onClick={() => handleLogout()}>Kirjaudu ulos</Button>
    )
}

export default Logout;