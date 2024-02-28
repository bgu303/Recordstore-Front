import * as React from 'react';
import { useState } from 'react';
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-material.css';
import { Button } from '@mui/material';
import TextField from '@mui/material/TextField';
import '../styling/Createuser.css';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from './Apiconstants';

function CreateUser() {
    const [user, setUser] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        role: "USER"
    })

    const navigate = useNavigate();

    const createUser = async () => {
        if (user.email.trim() === "" || user.password.trim() === "" || user.confirmPassword === "") {
            return alert("Täytä kaikki kentät.");
        }
        if (user.password !== user.confirmPassword) {
            return alert("Salasanat eivät ole samat");
        }
        if (user.password.length < 9) {
            return alert("Salasanan tulee olla vähintään 9 merkkiä pitkä.");
        }

        try {
            const response = await fetch(`${BASE_URL}/user/createuser`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    email: user.email,
                    password: user.password,
                    role: user.role
                })
            })

            if (!response.ok) {
                if (response.status === 501) {
                    return alert("Sähköposti on jo käytössä.");
                }
                alert("Jokin meni vikaan käyttäjää luodessa.");
            } else {
                setUser({
                    email: "",
                    password: "",
                    confirmPassword: "",
                    role: "USER"
                });
                alert("Käyttäjä luotu!");
                navigate("/login");

            }
        } catch (error) {
            console.log(`Error in creating user: ${error}`);
        }
    }

    //If user presses enter key on either TextField -> tries to create user.
    const handleKeyPress = (e) => {
        if (e.keyCode === 13) {
            createUser();
        }
    }

    return (
        <>
            <div className="mainDiv">
                <h3>Luo Käyttäjä</h3>
                <TextField
                    label="Sähköposti tai käyttäjänimi"
                    onChange={e => setUser({ ...user, email: e.target.value })}
                    value={user.email}
                    onKeyDown={handleKeyPress}
                />
                <TextField label="Salasana"
                    type="password"
                    onChange={e => setUser({ ...user, password: e.target.value })}
                    value={user.password}
                    onKeyDown={handleKeyPress}
                />
                <TextField label="Salasana uudelleen"
                    type="password"
                    onChange={e => setUser({ ...user, confirmPassword: e.target.value })}
                    value={user.confirmPassword}
                    onKeyDown={handleKeyPress}
                />
                <Button onClick={() => createUser()}>Luo käyttäjä</Button>
            </div>
        </>
    )
}

export default CreateUser;