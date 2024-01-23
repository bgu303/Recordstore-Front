import * as React from 'react';
import { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-material.css';
import { Button } from '@mui/material';
import TextField from '@mui/material/TextField';
import '../styling/Createuser.css'
import { jwtDecode } from 'jwt-decode';

function Login({ isLoggedIn, setIsLoggedIn, loggedInUser, setLoggedInUser }) {
    const [user, setUser] = useState({
        email: "",
        password: "",
    });


    const login = async () => {
        if (user.email.trim() === "" || user.password.trim() === "") {
            return alert("Täytä molemmat kentät");
        }
        try {
            const response = await fetch("http://localhost:3001/user/login", {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    email: user.email,
                    password: user.password
                })
            })

            if (!response.ok) {
                if (response.status === 401) {
                    return alert("Salasana tai käyttäjänimi väärin.");
                }
                return alert("Jokin meni vikaan.");
            } else {
                const data = await response.json();
                const { token } = data;
                const decodedToken = jwtDecode(token);
                setLoggedInUser({
                    email: decodedToken.email,
                    role: decodedToken.user_role
                  });

                setIsLoggedIn(true);
                alert("Kirjauduttu sisään!");
            }
        } catch (error) {
            console.log(`Error logging in: ${error}`);
        }
    }

    return (
        <>
        <div className="mainDiv">
            <h3>Kirjaudu sisään</h3>
            <TextField
            label="Sähköposti"
            onChange={e => setUser({...user, email: e.target.value})}
            />
            <TextField label="Salasana"
            onChange={e => setUser({...user, password: e.target.value})}
            />
            <Button onClick={() => login()}>Kirjaudu Sisään</Button>
        </div>
        </>
    )
}

export default Login;