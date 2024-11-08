import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Switch, Button } from '@mui/material';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-material.css';
import { useNavigate } from 'react-router-dom';

import { BASE_URL } from './Apiconstants';

function UserListTool() {
    const token = localStorage.getItem("jwtToken")
    const [allUsers, setAllUsers] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const userRole = localStorage.getItem("loggedInUserRole");
        if (userRole !== "ADMIN") {
            navigate("/records");
        }
    }, [navigate]);

    const getAllUsers = () => {
        fetch(`${BASE_URL}/user/getallusers`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Something went wrong");
                }
            })
            .then(responseData => {
                const loggedInUserId = localStorage.getItem("loggedInUserId");

                const filteredUsers = responseData.filter(user =>
                    user.id != loggedInUserId && user.email !== "Järjestelmä"
                );
                setAllUsers(filteredUsers);
            })
            .catch(error => {
                console.log(error.message);
                setAllUsers([]);
            });
    };

    useEffect(() => {
        getAllUsers();
    }, [])

    const allowOrdering = (data) => {
        const userId = data.id;
        fetch(`${BASE_URL}/user/toggleorderingaccess`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ userId: userId })
        })
            .then(response => {
                if (response.ok) {
                    getAllUsers();
                } else {
                    return response.json().then(errorData => {
                        alert("Jokin meni vikaan.");
                    });
                }
            })
            .catch(error => {
                alert("Jokin meni vikaan.");
            });
    };


    const deleteUser = (data) => {
        const userId = data.id;

        if (window.confirm("Haluatko varmasti poistaa käyttäjän?")) {
            fetch(`${BASE_URL}/user/deleteuseradmin`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ userId: userId })
            })
                .then(response => {
                    if (response.ok) {
                        // Refresh user list after successful deletion
                        getAllUsers();
                    } else {
                        return response.json().then(errorData => {
                            alert("Jokin meni pieleen.");
                        });
                    }
                })
                .catch(error => {
                    alert("Käyttäjää poistaessa tapahtui virhe.");
                });
        } else {
            console.log("Jokin meni pieleen.");
        }
    };

    const columnDefs = [
        { headerName: "Nimi", field: "user_name", sortable: true, filter: true, cellStyle: { textAlign: "center" } },
        { headerName: "Nimimerkki", field: "user_nickname", sortable: true, filter: true, cellStyle: { textAlign: "center" } },
        { headerName: "Sähköposti", field: "email", sortable: true, filter: true, cellStyle: { textAlign: "center" } },
        {
            headerName: "Luontipäivä",
            field: "created_at",
            sortable: true,
            filter: true,
            cellStyle: { textAlign: "center" },
            valueFormatter: (params) => {
                if (params.value) {
                    const date = new Date(params.value);
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    const seconds = String(date.getSeconds()).padStart(2, '0');
                    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
                }
                return "";
            }
        },
        {
            cellRenderer: params => <Button size="small" variant="contained" color="error" onClick={() => deleteUser(params.data)}>Poista käyttäjä</Button>,
            suppressMovable: true,
            cellStyle: { textAlign: "center" },
        }
    ];

    return (
        <>
            <h1 style={{ textAlign: "center" }}>Käyttäjätyökalu</h1>
            <div className="ag-theme-material trainings" style={{ height: 700, width: 1250, fontSize: 11, fontWeight: "bold", margin: "auto" }}>
                <AgGridReact
                    rowData={allUsers}
                    columnDefs={columnDefs}
                />
            </div>
        </>
    );
}

export default UserListTool;
