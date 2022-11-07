import { Button, Typography } from "@material-ui/core";
import React, { useState } from "react";
import ReactItemsCarousel from "react-items-carousel";
import image1 from "../image-1.png";
import ImageCard from "./ImageCard";

export default function ChooseImages({ handleBack }) {
  const [active, setActive] = useState(0);

  return (
    <div className="column" style={{ gap: 5 }}>
      <Typography variant="h6" style={{ textAlign: "start" }}>
        Choose the generated images:
      </Typography>
      <div className="row" style={{ gap: 10 }}>
        <ReactItemsCarousel
          gutter={12}
          timeout={1}
          activePosition={"center"}
          chevronWidth={60}
          disableSwipe={false}
          alwaysShowChevrons={false}
          numberOfCards={4}
          slidesToScroll={4}
          outsideChevron={false}
          showSlither={false}
          firstAndLastGutter={false}
          activeItemIndex={active}
          requestToChangeActive={(value) => setActive(value)}
          rightChevron={">"}
          leftChevron={"<"}
        >
          <ImageCard image={image1} />
          <ImageCard image={image1} />
          <ImageCard image={image1} />
          <ImageCard image={image1} />
        </ReactItemsCarousel>
      </div>
      <div
        className="column"
        style={{
          alignItems: "flex-end",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          style={{ width: 250 }}
          onClick={() => {
            handleBack();
          }}
        >
          Confirm selection
        </Button>
      </div>
    </div>
  );
}
