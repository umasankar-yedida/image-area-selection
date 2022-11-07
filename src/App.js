import "./App.css";
import FileUploaderAndViewer from "./components/FileUploaderAndViewer";
import { Grid } from "@material-ui/core";

function App() {
  return (
    <div className="App">
      <Grid container style={{ height: "100vh" }}>
        <Grid item xs={12}>
          <FileUploaderAndViewer />
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
