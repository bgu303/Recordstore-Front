import * as React from 'react';
import { useState, useEffect } from 'react';
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-material.css';
import { Button } from '@mui/material';
import TextField from '@mui/material/TextField';
import '../styling/Createuser.css'
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

import { BASE_URL, BASE_URL_CLOUD } from './Apiconstants';

function Login({ isLoggedIn, setIsLoggedIn, loggedInUser, setLoggedInUser, conversationId, setConversationId, conversationMessages, setConversationMessages, setToken }) {
    const [user, setUser] = useState({
        email: "",
        password: "",
    });

    useEffect(() => {
        if (isLoggedIn === true) {
            navigate("/records")
        }
    }, [])

    const navigate = useNavigate();

    useEffect(() => {
        if (isLoggedIn === true) {
            localStorage.setItem("isLoggedIn", isLoggedIn);
            localStorage.setItem("loggedInUserId", loggedInUser.id);
            localStorage.setItem("loggedInUserEmail", loggedInUser.email);
            localStorage.setItem("loggedInUserRole", loggedInUser.role);
            localStorage.setItem("jwtToken", loggedInUser.token)
        }
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
                setToken(token);
                const decodedToken = jwtDecode(token);

                setLoggedInUser({
                    email: decodedToken.email,
                    role: decodedToken.userRole,
                    id: decodedToken.userId,
                    token: token
                });
                setIsLoggedIn(true);
                setUser({
                    email: "",
                    password: ""
                });
                setTimeout(() => {
                    navigate("/")
                }, 300);
            })
            .catch(error => {
                console.log(`Error logging in: ${error}`);
                alert("Salasana tai käyttäjänimi väärin.");
            });
    };

    const navigateDeleteUser = () => {
        navigate("/deleteuser");
    }

    const navigateCreateUser = () => {
        navigate("/createuser");
    }

    //If user presses enter key on either TextField -> tries to login.
    const handleKeyPress = (e) => {
        if (e.keyCode === 13) {
            login();
        }
    }

    return (
        <div className="mainDiv">
            <h3>Kirjaudu</h3>
            <div className="formGroup">
                <label className="formLabel">Sähköposti*</label>
                <TextField
                    id="email"
                    label="Sähköposti"
                    size="small"
                    onChange={e => setUser({ ...user, email: e.target.value })}
                    value={user.email}
                    onKeyDown={handleKeyPress}
                    style={{ backgroundColor: "white", borderRadius: 10 }}
                />
            </div>
            <div className="formGroup">
                <label className="formLabel">Salasana*</label>
                <TextField
                    id="password"
                    label="Salasana"
                    size="small"
                    type="password"
                    onChange={e => setUser({ ...user, password: e.target.value })}
                    value={user.password}
                    onKeyDown={handleKeyPress}
                    style={{ backgroundColor: "white", borderRadius: 10 }}
                />
            </div>
            <Button color="success" variant="contained" onClick={login} style={{ borderRadius: "15px", marginTop: "10px" }}>
                Kirjaudu
            </Button>
            <hr className="separator" />
            <div className="frontPagePDiv">
                <div className="infoBox">
                    <p>Et ole luonut käyttäjää vielä?</p>
                    <p>Voit tehdä sen <span onClick={navigateCreateUser} style={{ color: "#1bd8f5", fontWeight: "bold", cursor: "pointer" }}>Täältä.</span></p>
                </div>
                <div className="infoBox">
                    <p>Haluatko poistaa käyttäjäsi?</p>
                    <p>Voit tehdä sen <span onClick={navigateDeleteUser} style={{ color: "red", fontWeight: "bold", cursor: "pointer" }}>TÄSTÄ</span> linkistä.</p>
                </div>
            </div>
        </div>
    );
}

export default Login;