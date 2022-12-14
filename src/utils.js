import domtoimage from "dom-to-image";

export function draggableElement(element, parentElement) {
  let left = 0;
  let top = 0;
  let newLeft = 0;
  let newTop = 0;

  const dragRect = element.getBoundingClientRect();
  const { width, height } = dragRect;

  element.onmousedown = dragDown;

  function dragDown(event) {
    event.preventDefault();

    left = event.clientX;
    top = event.clientY;

    document.onmousemove = dragMove;
    document.onmouseup = dragUp;
    element.style.cursor = "grabbing";
  }

  function dragMove(event) {
    event.preventDefault();

    newLeft = left - event.clientX;
    newTop = top - event.clientY;
    left = event.clientX;
    top = event.clientY;

    let updatedTop = element.offsetTop - newTop;
    let updatedLeft = element.offsetLeft - newLeft;

    // Checking bounds
    if (
      updatedLeft < 0 ||
      updatedTop < 0 ||
      updatedLeft + width > parentElement.offsetWidth ||
      updatedTop + height > parentElement.offsetHeight
    ) {
      return;
    }

    element.style.top = updatedTop + "px";
    element.style.left = updatedLeft + "px";
  }

  function dragUp() {
    document.onmousemove = null;
    document.onmouseup = null;
    element.style.cursor = "grab";
  }
}

function drawLineTo(context, x, y, width = 2) {
  context.strokeStyle = "#ff0000";
  context.lineWidth = width;
  context.lineTo(x, y);
  context.stroke();
}

function drawGrid(context, points) {
  // FIXME: Revisit this logic and properly determine horizontal & vertical lines
  let horizontal = [
    [points[0], points[1]],
    [points[3], points[2]],
  ];
  let vertical = [
    [points[0], points[3]],
    [points[1], points[2]],
  ];

  drawLines(context, horizontal[0], horizontal[1]);
  drawLines(context, vertical[0], vertical[1]);
}

function drawLines(context, l1, l2) {
  const [p1, p2] = l1;
  const [p3, p4] = l2;

  const np1 = {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
  const np2 = {
    x: (p3.x + p4.x) / 2,
    y: (p3.y + p4.y) / 2,
  };

  context.moveTo(np1.x, np1.y);
  drawLineTo(context, np2.x, np2.y, 1);

  // check if there is enough space between p1 - np1 & p3 - np2
  if (
    (Math.abs(p1.x - np1.x) > 80 && Math.abs(p3.x - np2.x) > 80) ||
    (Math.abs(p1.y - np1.y) > 80 && Math.abs(p3.y - np2.y) > 80)
  ) {
    drawLines(context, [p1, np1], [p3, np2]);
  }
  // check if there is enough space between p2 - np1 & p4 - np2
  if (
    (Math.abs(p2.x - np1.x) > 80 && Math.abs(p4.x - np2.x) > 80) ||
    (Math.abs(p2.y - np1.y) > 80 && Math.abs(p4.y - np2.y) > 80)
  ) {
    drawLines(context, [p2, np1], [p4, np2]);
  }
}

export function drawOnCanvasUsingMouseEvents(
  canvas,
  onStart,
  onRegionSelected
) {
  canvas.style.cursor = "cell";

  const context = canvas.getContext("2d");
  let points = [];

  let current;
  let start = false;

  function onMouseDown(e) {
    current = {
      x: e.offsetX,
      y: e.offsetY,
    };

    if (points.length === 3) {
      // draw line between last point and the first point
      drawLineTo(context, points[0].x, points[0].y);
      points.push(current);

      // we have reached the limit
      onRegionSelected(points); // callback
      drawGrid(context, points);

      start = false;
      points = [];
      canvas.onmousemove = null;
      return;
    }

    if (points.length === 0 && onStart) {
      onStart();
    }
    points.push(current);
    start = true;
    canvas.onmousemove = onMouseMove;
  }

  function onMouseMove(e) {
    if (!start || points.length < 1) {
      return;
    }

    redrawPoints();
    drawLineTo(context, e.offsetX, e.offsetY);
  }

  function redrawPoints() {
    if (points.length < 1) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    context.fillStyle = "#ff0000";

    context.moveTo(points[0].x, points[0].y);

    points.forEach((point, index) => {
      if (index === 0) return;
      drawLineTo(context, point.x, point.y);
    });
  }

  canvas.onmousedown = onMouseDown;

  function onKeyUp(e) {
    if (e.code === "Escape") {
      // Clean-up
      context.clearRect(0, 0, canvas.width, canvas.height);
      canvas.onmousemove = null;
      points = [];
      start = false;
    }
  }

  document.onkeyup = onKeyUp;
}

export const getPoints = (points) => {
  if (points.length === 0) {
    return "[]";
  }

  const data = [];
  points.forEach((point) => {
    data.push(`[X: ${point.x}, Y: ${point.y}]`);
  });

  return data.join(", ");
};

export function downloadSelectedArea(node, points, width, height) {
  let minX = 1000000;
  let minY = 1000000;
  let maxX = 0;
  let maxY = 0;

  points.forEach((point) => {
    minX = Math.min(point.x, minX);
    minY = Math.min(point.y, minY);
    maxX = Math.max(point.x, maxX);
    maxY = Math.max(point.y, maxY);
  });

  const h = maxY - minY;
  const w = maxX - minX;

  const downloadCanvas = document.createElement("canvas");
  const context = downloadCanvas.getContext("2d");

  function download(canvas) {
    const a = document.createElement("a");
    a.href = canvas.toDataURL();
    a.download = "selected.png";
    a.click();

    // Open in new TAB and display the image in it
    const newTab = window.open();
    newTab.document.body.innerHTML = `<img src=${canvas.toDataURL()} />`;
  }

  downloadCanvas.width = width;
  downloadCanvas.height = height;

  domtoimage.toPng(node).then((data) => {
    const image = new Image();
    image.onload = () => {
      const [p1, p2, p3, p4] = points;
      context.moveTo(p1.x, p1.y);
      context.beginPath();
      context.lineTo(p2.x, p2.y);
      context.lineTo(p3.x, p3.y);
      context.lineTo(p4.x, p4.y);
      context.lineTo(p1.x, p1.y);
      context.closePath();

      context.clip();

      context.drawImage(image, 0, 0);
      const data = context.getImageData(minX, minY, w, h);
      context.clearRect(0, 0, downloadCanvas.width, downloadCanvas.height);
      downloadCanvas.width = w;
      downloadCanvas.height = h;
      context.putImageData(data, 0, 0);
      download(downloadCanvas);
    };
    image.src = data;
  });
}

export function drawRectsInCanvasUsingMouseEvents(
  canvas,
  onStart = () => null,
  onFinish = () => null
) {
  let current = null;
  const context = canvas.getContext("2d");
  context.fillStyle = "#ff0000";
  canvas.style.cursor = "cell";

  function onMouseDown(e) {
    if (current) {
      let points = [];
      let { x: x1, y: y1 } = current;
      let { offsetX: x2, offsetY: y2 } = e;

      const w = Math.abs(x1 - x2);
      const h = Math.abs(y1 - y2);

      drawRect(e);

      let isHigher = x1 > x2 || y1 > y2;
      if (isHigher) {
        let t = x1;
        x1 = x2;
        x2 = t;
        t = y1;
        y1 = y2;
        y2 = t;
      }
      points.push(
        { x: x1, y: y1 },
        { x: x1 + w, y: y1 },
        { x: x2, y: y2 },
        { x: x1, y: y1 + h }
      );

      drawGrid(context, points);

      if (onFinish) {
        onFinish(points);
      }

      canvas.onmousemove = null;
      current = null;
      return;
    }

    current = {
      x: e.offsetX,
      y: e.offsetY,
    };
    canvas.onmousemove = onMouseMove;

    if (onStart) {
      onStart();
    }
  }

  function onMouseMove(e) {
    drawRect(e);
  }

  function drawRect(e) {
    const { offsetX: x2, offsetY: y2 } = e;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    context.strokeStyle = "red";
    context.lineWidth = 3;

    const { x: x1, y: y1 } = current;

    const w = Math.abs(x1 - x2);
    const h = Math.abs(y1 - y2);

    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);

    context.strokeRect(x, y, w, h);
  }

  function onKeyUp(e) {
    if (e.code === "Escape") {
      // Clean-up
      context.clearRect(0, 0, canvas.width, canvas.height);
      canvas.onmousemove = null;
      current = null;
    }
  }

  document.onkeyup = onKeyUp;

  canvas.onmousedown = onMouseDown;
}
