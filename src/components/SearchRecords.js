import { TextField } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../styling/Searchrecords.css';

import { BASE_URL, BASE_URL_CLOUD } from './Apiconstants';

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
                
                responseData = responseData.filter(record => record.sold === 0);
                setRecords(responseData);
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
        <div className="search-container">
            <TextField
                className="search-textfield"
                onChange={e => setSearchTerm(e.target.value)}
                value={searchTerm}
                size="small"
                onKeyDown={handleKeyPress}
                placeholder="Hae levyistä..."
            />
            <span className="search-span" onClick={() => searchRecords()}>Hae</span>
        </div>
    );
}

export default SearchRecords;
