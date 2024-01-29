import { Button } from '@mui/material';
import { useNavigate } from "react-router-dom";

function Logout({ setIsLoggedIn, setLoggedInUser }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        setIsLoggedIn(false);
        setLoggedInUser({
            email: "",
            role: "",
            id: null
        });
        localStorage.clear();
        navigate("/");
    }

    return (
        <Button onClick={() => handleLogout()}>Kirjaudu ulos</Button>
    )
}

export default Logout;