import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BASE_URL, BASE_URL_CLOUD } from './Apiconstants';

function DeleteUser() {
    const [user, setUser] = useState({
        email: "",
        password: ""
    })

    const navigate = useNavigate();

    const deleteUser = () => {
        const confirmation = window.confirm("Haluatko varmasti poistaa käyttäjäsi?");
        if (confirmation) {
            fetch(`${BASE_URL}/user/deleteuser`, {
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
                <div>
                    <label style={{ fontWeight: "bold", display: "block", marginBottom: 10 }}>Sähköposti*</label>
                    <TextField
                        label="Sähköposti"
                        size="small"
                        onChange={e => setUser({ ...user, email: e.target.value })}
                        value={user.email}
                        style={{ backgroundColor: "white", borderRadius: 10 }}
                    />
                </div>
                <div>
                    <label style={{ fontWeight: "bold", display: "block", marginBottom: 10 }}>Sähköposti*</label>
                    <TextField
                        label="Salasana"
                        size="small"
                        onChange={e => setUser({ ...user, password: e.target.value })}
                        value={user.password}
                        type="password"
                        style={{ backgroundColor: "white", borderRadius: 10 }}
                    />
                </div>
                <p><span style={{ fontWeight: "bold" }}>HUOM! </span>Käyttäjän poistamista EI voi perua.</p>
                <Button color="error" variant="contained" style={{ borderRadius: 15 }} onClick={() => deleteUser()}>Poista Käyttäjä</Button>
            </div>
        </>
    )
}

export default DeleteUser;