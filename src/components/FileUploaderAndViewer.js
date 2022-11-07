import {
  CircularProgress,
  Grid,
  Snackbar,
  Typography,
} from "@material-ui/core";
import { CloudUpload } from "@material-ui/icons";
import React, { useEffect, useRef, useState } from "react";
import { drawOnCanvasUsingMouseEvents, getPoints } from "../utils";
import ChooseImages from "./ChooseImages";
import SelectImageArea from "./SelectImageArea";

export default function FileUploaderAndViewer() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [showSelection, setShowSelection] = useState(false);
  const [showChooser, setShowChooser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageData, setImageData] = useState(false);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const [showSnackbar, setShowSnackbar] = useState(null);

  const fileRef = useRef();
  const parent = useRef();
  const view = useRef();

  useEffect(() => {
    const dropRegion = parent.current;
    if (!dropRegion || imageData) {
      return;
    }

    function onDragOver(e) {
      e.preventDefault();
      setIsDragging(true);
    }
    function onDragLeave() {
      setIsDragging(false);
    }
    function onDrop(e) {
      e.preventDefault();
      setIsDragging(false);
      setFile(e.dataTransfer.files[0]);
    }

    dropRegion.addEventListener("dragover", onDragOver);
    dropRegion.addEventListener("dragleave", onDragLeave);
    dropRegion.addEventListener("drop", onDrop);

    function onInputChange() {
      setFile(this.files[0]);
    }

    const inputNode = fileRef.current;
    inputNode.addEventListener("change", onInputChange);

    // Clean-up
    return () => {
      dropRegion.removeEventListener("dragover", onDragOver);
      dropRegion.removeEventListener("dragleave", onDragLeave);
      dropRegion.removeEventListener("drop", onDrop);

      inputNode.removeEventListener("change", onInputChange);
    };
  }, [imageData]);

  useEffect(() => {
    if (!file) {
      return;
    }

    setShowChooser(false);
    setShowSelection(false);
    setLoading(true);

    const image = new Image();
    image.onload = () => {
      setWidth(image.width);
      setHeight(image.height);

      // Fake delay to look like a natural flow
      setTimeout(() => {
        setImageData(image.src);
        if (image.width !== image.height) {
          setShowSelection(true);
        } else {
          setShowChooser(true);
          view.current.innerHTML = `<img src="${image.src}" /><canvas id="canvas-internal" width="${image.width}" height="${image.height}" class="position-absolute" style="cursor: cell"></canvas>`;
          const canvas = document.getElementById("canvas-internal");
          drawOnCanvasUsingMouseEvents(canvas, (points) => {
            setShowSnackbar(points);
            setTimeout(() => {
              setShowSnackbar(null);
            }, 3000);
          });
        }
        setLoading(false);
      }, 1000);
    };

    let fileReader = new FileReader();
    fileReader.onload = () => {
      image.src = fileReader.result;
    };
    fileReader.readAsDataURL(file);
  }, [file]);

  return (
    <>
      {!showSelection && (
        <Grid container style={{ padding: 20 }}>
          <Grid item xs={5}>
            <div className="column" style={{ gap: 5 }}>
              {!showChooser && (
                <div
                  ref={parent}
                  className={
                    isDragging ? "drag drop-region-upload" : "drag drop-region"
                  }
                  onClick={() => fileRef.current?.click()}
                >
                  {!loading && (
                    <>
                      <div className="row">
                        <Typography
                          variant="h4"
                          className="column center"
                          style={{
                            gap: 8,
                          }}
                        >
                          <CloudUpload color="primary" fontSize="large" />
                          {isDragging
                            ? " Release to upload image"
                            : " Drag & drop or click to upload image"}
                        </Typography>
                      </div>
                      <input
                        ref={fileRef}
                        id="fileChooser"
                        type="file"
                        hidden
                        accept="image/png,image/jpg,image/jpeg"
                      />
                    </>
                  )}
                  {loading && (
                    <div
                      className="row center"
                      style={{
                        gap: 8,
                      }}
                    >
                      <CircularProgress color="primary" fontSize="large" />
                      {"   "}
                      Uploading
                    </div>
                  )}
                </div>
              )}
              <div className="column" style={{ gap: 5 }}>
                {imageData && (
                  <Typography variant="h4">Original Image</Typography>
                )}
                <div ref={view} style={{ position: "relative" }}></div>
              </div>
            </div>
          </Grid>
          {showChooser && (
            <Grid item xs={7}>
              <ChooseImages
                handleBack={() => {
                  setShowChooser(false);
                  setShowSelection(false);
                  setImageData(null);
                  view.current.innerHTML = "";
                }}
                imageData={imageData}
              />
            </Grid>
          )}
        </Grid>
      )}
      {showSelection && (
        <SelectImageArea
          imageFile={file}
          imageData={imageData}
          width={width}
          height={height}
          handleBack={() => {
            setShowSelection(false);
            setShowChooser(false);
            setImageData(null);
          }}
        />
      )}
      {showSnackbar && (
        <Snackbar
          open={true}
          autoHideDuration={3000}
          message={
            <div className="column">
              <Typography>Co-ordinates: {getPoints(showSnackbar)}</Typography>
            </div>
          }
        />
      )}
    </>
  );
}
