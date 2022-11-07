import { makeStyles } from "@material-ui/core";
import { CheckCircle, CheckCircleOutline } from "@material-ui/icons";
import React, { useState } from "react";

const useImageStyles = makeStyles((theme) => ({
  image: {
    position: "relative",
    "&:hover": {
      cursor: "pointer",
      backgroundColor: "#6d6d6d",
    },
  },
  icon: {
    position: "absolute",
    right: "1%",
    color: "white",
  },
}));

export default function ImageCard({ image }) {
  const [selected, setSelected] = useState(false);
  const classes = useImageStyles({ selected });

  return (
    <div
      className={classes.image}
      onClick={() => setSelected(!selected)}
      style={{ backgroundColor: selected ? "#4f6e70" : "transparent" }}
    >
      <img src={image} width={150} height={150} alt="someimage" />
      {selected && (
        <CheckCircle
          className={classes.icon}
          color="primary"
          onClick={() => setSelected(false)}
        />
      )}
      {!selected && (
        <CheckCircleOutline
          className={classes.icon}
          color="primary"
          onClick={() => setSelected(true)}
        />
      )}
    </div>
  );
}
