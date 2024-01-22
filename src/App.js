import './App.css';
import FrontPage from './components/Frontpage';
import Records from './components/Records';
import CreateUser from './components/Createuser';
import "./App.css";
import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { Tabs, Tab } from "@mui/material";
import Typography from "@mui/material/Typography";

function App() {

  const [page, setPage] = useState("Etusivu")

  const changeTab = (event, page) => {
    setPage(page)
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
          <Tab label="Luo Käyttäjä" className="tabs" value="Luo Käyttäjä"></Tab>
        </Tabs>
      </AppBar>
      {page === "Etusivu" && <FrontPage />}
      {page === "Levylista" && <Records />}
      {page === "Luo Käyttäjä" && <CreateUser />}
    </>
  );
}

export default App;
