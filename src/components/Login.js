import * as React from 'react';
import { useState, useEffect } from 'react';
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-material.css';
import { Button } from '@mui/material';
import TextField from '@mui/material/TextField';
import '../styling/Createuser.css'
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from './Apiconstants';

function Login({ isLoggedIn, setIsLoggedIn, loggedInUser, setLoggedInUser }) {
    const [user, setUser] = useState({
        email: "",
        password: "",
    });

    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem("isLoggedIn", isLoggedIn);
        localStorage.setItem("loggedInUserId", loggedInUser.id);
        localStorage.setItem("loggedInUserEmail", loggedInUser.email);
        localStorage.setItem("loggedInUserRole", loggedInUser.role);
    }, [isLoggedIn])
    
    const login = () => {
        if (user.email.trim() === "" || user.password.trim() === "") {
            return alert("Täytä molemmat kentät");
        }
    
        fetch(`${BASE_URL}/user/login`, {
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
            const { token } = data;
            const decodedToken = jwtDecode(token);
    
            setLoggedInUser({
                email: decodedToken.email,
                role: decodedToken.userRole,
                id: decodedToken.userId
            });
            setIsLoggedIn(true);
            setUser({
                email: "",
                password: ""
            });
            setTimeout(() => {
                navigate("/records")
             }, 300);
        })
        .catch(error => {
            console.log(`Error logging in: ${error}`);
            alert("Jokin meni vikaan.");
        });
    };
    

    return (
        <>
            <div className="mainDiv">
                <h3>Kirjaudu sisään</h3>
                <TextField
                    label="Sähköposti tai käyttäjänimi"
                    onChange={e => setUser({ ...user, email: e.target.value })}
                    value={user.email}
                />
                <TextField label="Salasana"
                    type="password"
                    onChange={e => setUser({ ...user, password: e.target.value })}
                    value={user.password}
                />
                <Button onClick={() => login()}>Kirjaudu Sisään</Button>
            </div>
        </>
    )
}

export default Login;