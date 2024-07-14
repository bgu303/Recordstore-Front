import { TextField } from "@mui/material";
import { BASE_URL, BASE_URL_CLOUD } from './Apiconstants';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SearchRecords({ setSearchOpen, searchResults, setSearchResults }) {
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const searchRecords = () => {
        if (searchTerm.trim() === "") {
            return;
        }

        fetch(`${BASE_URL_CLOUD}/search/${encodeURIComponent(searchTerm)}`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Something went wrong");
                }
            })
            .then(responseData => {
                console.log("Search results:", responseData);
                setSearchResults(responseData);
                navigate("/search")
            })
            .catch(error => {
                console.error("Fetch error:", error);
            });
    }

    const handleKeyPress = (e) => {
        if (e.keyCode === 13) {
            searchRecords();
            return;
        }
    }

    return (
        <>
            <TextField onChange={e => setSearchTerm(e.target.value)}
                value={searchTerm}
                size="small"
                style={{ backgroundColor: "white", borderRadius: 10 }}
                onKeyDown={handleKeyPress}
                placeholder="Hae levyistä..."
            />
            <span onClick={() => searchRecords()} style={{ color: "white", marginLeft: 10, cursor: "pointer" }}>Hae</span>
        </>
    );
}

export default SearchRecords;
