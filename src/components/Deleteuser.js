import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import { useState } from 'react';
import { BASE_URL, BASE_URL_CLOUD } from './Apiconstants';
import { useNavigate } from 'react-router-dom';

function DeleteUser() {

    const [user, setUser] = useState({
        email: "",
        password: ""
    })

    const navigate = useNavigate();

    const deleteUser = () => {
        const confirmation = window.confirm("Haluatko varmasti poistaa käyttäjäsi?");
        if (confirmation) {
            fetch(`${BASE_URL_CLOUD}/user/deleteuser`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    email: user.email,
                    password: user.password
                })
            })
                .then(response => {
                    if (!response.ok) {
                        if (response.status === 401) {
                            return Promise.reject("Salasana tai käyttäjänimi väärin.");
                        }
                        return Promise.reject("Jokin meni vikaan.");
                    }
                    return response.json();
                })
                .then(data => {
                    alert("Käyttäjä poistettu!");
                    navigate("/records");
                })
                .catch(error => {
                    console.log(`Error deleting user: ${error}`);
                    alert("Jokin meni vikaan");
                })
        }
    }


    return (
        <>
            <div className="mainDiv">
                <h2>Poista käyttäjä</h2>
                <TextField
                    label="Sähköposti tai käyttäjänimi"
                    onChange={e => setUser({ ...user, email: e.target.value })}
                    value={user.email}
                />
                <TextField label="Salasana"
                    onChange={e => setUser({ ...user, password: e.target.value })}
                    value={user.password}
                />
                <Button color="error" variant="contained" onClick={() => deleteUser()}>Poista Käyttäjä</Button>
            </div>
        </>
    )
}

export default DeleteUser;