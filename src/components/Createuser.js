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
        if (user.password !== user.confirmPassword) {
            alert("Salasanat eivät ole samat");
            return;
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
                navigate("/records");

            }
        } catch (error) {
            console.log(`Error in creating user: ${error}`);
        }
    }
 
    return (
        <>
        <div className="mainDiv">
            <h3>Luo Käyttäjä</h3>
            <TextField
            label="Sähköposti"
            onChange={e => setUser({...user, email: e.target.value})}
            value={user.email}
            />
            <TextField label="Salasana"
            onChange={e => setUser({...user, password: e.target.value})}
            value={user.password}
            />
            <TextField label="Salasana uudelleen"
            onChange={e => setUser({...user, confirmPassword: e.target.value})}
            value={user.confirmPassword}
            />
            <Button onClick={() => createUser()}>Luo käyttäjä</Button>
        </div>
        </>
    )
}

export default CreateUser;