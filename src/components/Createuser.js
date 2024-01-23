import * as React from 'react';
import { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-material.css';
import { Button } from '@mui/material';
import TextField from '@mui/material/TextField';
import '../styling/Createuser.css';

function CreateUser() {

    const [user, setUser] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        role: "USER"
    })

    const createUser = async () => {
        if (user.password !== user.confirmPassword) {
            alert("Salasanat eivät ole samat");
            return;
        } 

        try {
            const response = await fetch("http://localhost:3001/user/createuser", {
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
                alert("Käyttäjä luotu!");
                setUser({
                    email: "",
                    password: "",
                    confirmPassword: "",
                    role: "USER"
                });
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
            />
            <TextField label="Salasana"
            onChange={e => setUser({...user, password: e.target.value})}
            />
            <TextField label="Salasana uudelleen"
            onChange={e => setUser({...user, confirmPassword: e.target.value})}
            />
            <Button onClick={() => createUser()}>Luo käyttäjä</Button>
        </div>
        </>
    )
}

export default CreateUser;