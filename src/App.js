import './App.css';
import FrontPage from './components/Frontpage';
import Records from './components/Records';
import CreateUser from './components/Createuser';
import Login from './components/Login';
import "./App.css";
import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { Tabs, Tab } from "@mui/material";
import Typography from "@mui/material/Typography";

function App() {

  const [page, setPage] = useState("Etusivu");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState({
    email: "",
    role: ""
  });

  const changeTab = (event, page) => {
    setPage(page);
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Mikon levykauppa</Typography>
        </Toolbar>
        <Tabs textColor="white" value={page} onChange={changeTab}>
          <Tab label="Etusivu" className="tabs" value="Etusivu"></Tab>
          <Tab label="Levylista" className="tabs" value="Levylista"></Tab>
          { !isLoggedIn && <Tab label="Luo Käyttäjä" className="tabs" value="Luo Käyttäjä"></Tab> }
          <Tab label="Kirjaudu Sisään" className="tabs" value="Kirjaudu Sisään"></Tab>
        </Tabs>
      </AppBar>
      {page === "Etusivu" && <FrontPage />}
      {page === "Levylista" && <Records isLoggedIn={isLoggedIn} loggedInUser={loggedInUser} />}
      {page === "Luo Käyttäjä" && <CreateUser />}
      {page === "Kirjaudu Sisään" && <Login isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />}
    </>
  );
}

export default App;
