import {
  Button,
  FormControlLabel,
  Grid,
  makeStyles,
  Slider,
  Snackbar,
  Switch,
  Tooltip,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  downloadSelectedArea,
  draggableElement,
  drawOnCanvasUsingMouseEvents,
  getPoints,
} from "../utils";

const marks = [
  {
    value: 0,
    label: "0%",
  },
  {
    value: 100,
    label: "100%",
  },
];

const useStyles = makeStyles((theme) => ({
  mark: {
    color: "white",
  },
}));

export default function SelectImageArea({
  imageData,
  width = 1080,
  height = 720,
  handleBack,
}) {
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [percentage, setPercentage] = useState(100);

  const [showErrorSnackbar, setShowErrorSnackbar] = useState(null);

  const [checked, setChecked] = useState(false);
  const [points, setPoints] = useState([]);

  const dragRef = useRef(null);
  const parentRef = useRef(null);
  const canvasRef = useRef(null);

  const classes = useStyles();

  useEffect(() => {
    const image = parentRef.current;
    // re-calculate the width and height based on the percentage
    const w = Math.max(512, width * (percentage / 100.0));
    const h = Math.max(512, height * (percentage / 100.0));
    image.style.width = w + "px";
    image.style.height = h + "px";

    const canvas = canvasRef.current;
    canvas.width = w;
    canvas.height = h;

    const drag = dragRef.current;
    // if drag region is not within image bounds, re-position it to 0,0
    if (
      drag.offsetTop + drag.offsetHeight >
        image.offsetTop + image.offsetHeight ||
      drag.offsetLeft + drag.offsetWidth > image.offsetLeft + image.offsetWidth
    ) {
      drag.style.top = 0;
      drag.style.left = 0;
    }
    setPoints([]);
  }, [percentage]);

  useLayoutEffect(() => {
    if (dragRef.current && parentRef.current) {
      draggableElement(dragRef.current, parentRef.current);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (checked) {
      setPoints([]);
      dragRef.current.style.display = "none";
      drawOnCanvasUsingMouseEvents(
        canvas,
        () => {
          // onStart selecting region callback
          setPoints([]);
        },
        (points) => {
          // onRegionSelected callback
          setPoints(points);
        }
      );

      return () => {
        canvas.onmousedown = null;
        document.onkeyup = null;
      };
    } else {
      dragRef.current.style.display = "block";
      // clear canvas
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.cursor = "default";
    }
  }, [checked]);

  return (
    <>
      <Grid container style={{ height: "100%" }}>
        <Grid item xs={8} style={{ overflow: "hidden" }}>
          <div
            style={{
              position: "relative",
            }}
          >
            <img
              ref={parentRef}
              src={imageData}
              className="position-absolute"
              style={{
                maxWidth: width,
              }}
              alt="image1"
            />
            <canvas
              className="position-absolute"
              style={{
                cursor: "cell",
                maxWidth: width,
              }}
              ref={canvasRef}
            />
            <div ref={dragRef} id="dragElement" className="draggable"></div>
          </div>
        </Grid>

        <Grid item xs={4}>
          <Grid container>
            <Grid item xs={2}>
              <Slider
                aria-label="size"
                orientation="vertical"
                value={percentage}
                step={1}
                marks={marks}
                color="primary"
                style={{ height: 300 }}
                onChange={(_, newValue) => setPercentage(newValue)}
                aria-labelledby="size-slider"
                classes={{ markLabel: classes.mark }}
              />
            </Grid>
            <Grid
              item
              className="column center"
              style={{
                gap: 20,
              }}
            >
              <Typography id="size-slider">
                Size: {parentRef.current?.offsetWidth ?? width}x
                {parentRef.current?.offsetHeight ?? height}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setShowSnackbar(true);
                  setTimeout(() => {
                    setShowSnackbar(false);
                  }, 3000);
                }}
              >
                Confirm selection
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  handleBack();
                }}
              >
                Go back to upload
              </Button>
              {checked && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    if (points.length !== 4) {
                      setShowErrorSnackbar("Select the region!");
                      setTimeout(() => {
                        setShowErrorSnackbar(null);
                      }, 10000);
                      return;
                    }

                    downloadSelectedArea(
                      parentRef.current,
                      points,
                      canvasRef.current.width,
                      canvasRef.current.height
                    );
                  }}
                >
                  Download selected region
                </Button>
              )}
              <Tooltip
                title={
                  <Typography variant="h6">
                    Choose 4 points on the image, you can also press Esc to
                    re-select
                  </Typography>
                }
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={checked}
                      onChange={(e) => setChecked(e.target.checked)}
                    />
                  }
                  label="Select Region"
                />
              </Tooltip>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {showSnackbar && (
        <Snackbar
          open={true}
          autoHideDuration={3000}
          message={
            <div className="column">
              <Typography>
                Selection Area Position Top: {dragRef.current?.offsetTop}, Left:{" "}
                {dragRef.current?.offsetLeft}
              </Typography>
              <Typography>
                Image Size: {parentRef.current?.offsetWidth}x
                {parentRef.current?.offsetHeight}
              </Typography>
              <Typography>Co-ordinates: {getPoints(points)}</Typography>
            </div>
          }
        />
      )}
      {showErrorSnackbar && (
        <Snackbar open={true} message={showErrorSnackbar} />
      )}
    </>
  );
}
