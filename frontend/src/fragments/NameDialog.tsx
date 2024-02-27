import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import useData from "../context/Data";
import { loadProfile } from "../utils/localstorage";
import { NAME_MAX_LENGTH } from "../utils/contants";

export default function NameDialog() {
  const { profile, setName } = useData();

  const [open, setOpen] = React.useState(true);
  const [formData, setFormData] = React.useState("");

  React.useEffect(() => {
    const old = loadProfile();
    if (old) setFormData(old.name);
  }, []);

  React.useEffect(() => {
    setOpen(!profile?.name);
  }, [profile]);

  const [error, setError] = React.useState(false);

  const handleConfirmName = () => {
    if (formData.trim().length < 5 || formData.trim().length > 15) {
      setFormData(formData.trim());
      return setError(true);
    }

    setName(formData.trim());
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(false);
    setFormData(event.target.value);
  };

  const note = !profile
    ? "Join with new Identity"
    : "Keep same identity but change name";

  return (
    <Dialog open={open}>
      <DialogTitle>Enter Your Name</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please enter your name below.
          <br />
          {note}
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Enter Name"
          type="text"
          fullWidth
          variant="standard"
          value={formData}
          onChange={handleNameChange}
          inputProps={{
            maxLength: NAME_MAX_LENGTH,
          }}
          error={error}
          helperText={error ? "Should be 5 to 15 characters" : ""}
          autoComplete="password2"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleConfirmName}>Join</Button>
      </DialogActions>
    </Dialog>
  );
}
