import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';

function DeleteUser() {

    const deleteUser = () => {
        console.log("Käyttäjä poistettu")
    }

    return (
        <>
            <div className="mainDiv">
                <h2>Poista käyttäjä</h2>
                <TextField label="Sähköposti tai käyttäjänimi"></TextField>
                <TextField label="Salasana"></TextField>
                <Button color="error" variant="contained" onClick={() => deleteUser()}>Poista Käyttäjä</Button>
            </div>
        </>
    )
}

export default DeleteUser;