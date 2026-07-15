import { createElementSize } from "~/fn/state/createElementSize";

type Vec2 = {
  x: number;
  y: number;
};

type Vec3 = {
  x: number;
  y: number;
  z: number;
};

type Mesh = {
  vertices: Vec3[];
  cols: number;
  rows: number;
};

type Camera = {
  distance: number;
  pitch: number;
  yaw: number;
};

const degToRad = (deg: number) => (deg * Math.PI) / 180;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const createWaveTableDraw = (p: {
  morphTable: Float32Array[];
  canvas: HTMLCanvasElement | undefined;
  currentMorphRatio: number;
  camera?: {
    distance?: number;
    pitch?: number;
    yaw?: number;
  };
  color: {
    base: string;
    main: string;
    accent: string;
  };
}) => {
  const size = createElementSize(() => p.canvas);

  return (_timeMs: number) => {
    const canvas = p.canvas;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, size().width);
    const height = Math.max(1, size().height);
    const pxW = Math.floor(width * dpr);
    const pxH = Math.floor(height * dpr);

    if (canvas.width !== pxW || canvas.height !== pxH) {
      canvas.width = pxW;
      canvas.height = pxH;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = p.color.base;
    ctx.fillRect(0, 0, width, height);

    if (p.morphTable.length === 0) return;

    const mesh = wavetableToMesh(p.morphTable, {
      phaseSamples: 128,
      depthSamples: Math.min(56, Math.max(8, p.morphTable.length)),
      amplitude: 1,
    });

    const model = meshToModel(mesh, {
      scaleX: 2.2,
      scaleY: 0.6,
      scaleZ: 2,
      centerX: true,
      centerZ: true,
    });

    const camera: Camera = {
      distance: p.camera?.distance ?? 7.5,
      pitch: p.camera?.pitch ?? degToRad(-25),
      yaw: p.camera?.yaw ?? degToRad(205),
    };

    const view = modelToView(model, camera);

    const waveTableMeshProjected = viewToProjection(view, {
      width,
      height,
      focal: Math.min(width, height) * 0.92,
      near: 0.2,
    });

    const boundsMeshProjected = projectBoundsBox(model, camera, {
      width,
      height,
      focal: Math.min(width, height) * 0.92,
      near: 0.2,
    });

    const fitTransform = getFitTransform(
      [...waveTableMeshProjected.points, ...boundsMeshProjected.points],
      width,
      height,
      12,
    );

    const waveTableMeshAdjusted = {
      ...waveTableMeshProjected,
      points: applyFitTransform(waveTableMeshProjected.points, fitTransform),
    };
    const boundsMeshAdjusted = {
      ...boundsMeshProjected,
      points: applyFitTransform(boundsMeshProjected.points, fitTransform),
    };

    projectionToCanvas(ctx, waveTableMeshAdjusted, {
      stroke: p.color.main,
      rowWidth: 1,
      colWidth: 0.9,
      colStep: 6,
    });
    drawBoundsBox(ctx, boundsMeshAdjusted, p.color.accent);

    const currentMorphIndex = Math.round(clamp(p.currentMorphRatio, 0, 1) * (p.morphTable.length - 1));
    const highlightRow = Math.round(
      clamp(
        currentMorphIndex / Math.max(1, p.morphTable.length - 1),
        0,
        1,
      )
      * (waveTableMeshAdjusted.rows - 1),
    );

    drawHighlightedRow(ctx, waveTableMeshAdjusted, highlightRow, p.color.accent);
  };
};

function rotateY(v: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  return {
    x: c * v.x + s * v.z,
    y: v.y,
    z: -s * v.x + c * v.z,
  };
}

function rotateX(v: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  return {
    x: v.x,
    y: c * v.y - s * v.z,
    z: s * v.y + c * v.z,
  };
}

function sampleMorphTable(tables: Float32Array[], frameNorm: number, phaseNorm: number) {
  if (tables.length === 0) return 0;

  const framePos = clamp(frameNorm, 0, 1) * (tables.length - 1);
  const frameA = Math.floor(framePos);
  const frameB = Math.min(frameA + 1, tables.length - 1);
  const frameT = framePos - frameA;

  const table = tables[frameA];
  if (!table || table.length === 0) return 0;

  const tableSize = table.length;
  const idx = clamp(phaseNorm, 0, 1) * (tableSize - 1);
  const idxA = Math.floor(idx);
  const idxB = Math.min(idxA + 1, tableSize - 1);
  const idxT = idx - idxA;

  const a0 = lerp(tables[frameA]![idxA]!, tables[frameA]![idxB]!, idxT);
  const b0 = lerp(tables[frameB]![idxA]!, tables[frameB]![idxB]!, idxT);
  return lerp(a0, b0, frameT);
}

function wavetableToMesh(
  tables: Float32Array[],
  options: {
    phaseSamples: number;
    depthSamples: number;
    amplitude: number;
  },
): Mesh {
  const cols = Math.max(2, options.phaseSamples);
  const rows = Math.max(2, options.depthSamples);
  const vertices: Vec3[] = [];

  for (let row = 0; row < rows; row += 1) {
    const v = row / (rows - 1);
    const z = 1 - v * 2;
    for (let col = 0; col < cols; col += 1) {
      const u = col / (cols - 1);
      const x = u * 2 - 1;
      const y = sampleMorphTable(tables, v, u) * options.amplitude;
      vertices.push({ x, y, z });
    }
  }

  return { vertices, cols, rows };
}

function meshToModel(
  mesh: Mesh,
  options: {
    scaleX: number;
    scaleY: number;
    scaleZ: number;
    centerX: boolean;
    centerZ: boolean;
  },
): Mesh {
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;

  for (const v of mesh.vertices) {
    minX = Math.min(minX, v.x);
    maxX = Math.max(maxX, v.x);
    minZ = Math.min(minZ, v.z);
    maxZ = Math.max(maxZ, v.z);
  }

  const centerX = options.centerX ? (minX + maxX) * 0.5 : 0;
  const centerZ = options.centerZ ? (minZ + maxZ) * 0.5 : 0;

  return {
    cols: mesh.cols,
    rows: mesh.rows,
    vertices: mesh.vertices.map((v) => ({
      x: (v.x - centerX) * options.scaleX,
      y: v.y * options.scaleY,
      z: (v.z - centerZ) * options.scaleZ,
    })),
  };
}

function modelToView(mesh: Mesh, camera: Camera): Mesh {
  return {
    cols: mesh.cols,
    rows: mesh.rows,
    vertices: mesh.vertices.map((v) => {
      const yawed = rotateY(v, camera.yaw);
      const pitched = rotateX(yawed, camera.pitch);
      return {
        x: yawed.x,
        y: pitched.y,
        z: pitched.z + camera.distance,
      };
    }),
  };
}

function projectBoundsBox(
  mesh: Mesh,
  camera: Camera,
  projection: {
    width: number;
    height: number;
    focal: number;
    near: number;
  },
) {
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let minZ = Number.POSITIVE_INFINITY;
  let maxZ = Number.NEGATIVE_INFINITY;

  for (const v of mesh.vertices) {
    minX = Math.min(minX, v.x);
    maxX = Math.max(maxX, v.x);
    minY = Math.min(minY, v.y);
    maxY = Math.max(maxY, v.y);
    minZ = Math.min(minZ, v.z);
    maxZ = Math.max(maxZ, v.z);
  }

  const corners: Vec3[] = [
    { x: minX, y: minY, z: minZ },
    { x: maxX, y: minY, z: minZ },
    { x: maxX, y: maxY, z: minZ },
    { x: minX, y: maxY, z: minZ },
    { x: minX, y: minY, z: maxZ },
    { x: maxX, y: minY, z: maxZ },
    { x: maxX, y: maxY, z: maxZ },
    { x: minX, y: maxY, z: maxZ },
  ];

  const points = corners.map((corner) => {
    const viewPoint = toViewPoint(corner, camera);
    return projectViewPoint(viewPoint, projection);
  });

  return { points };
}

function toViewPoint(v: Vec3, camera: Camera): Vec3 {
  const yawed = rotateY(v, camera.yaw);
  const pitched = rotateX(yawed, camera.pitch);
  return {
    x: yawed.x,
    y: pitched.y,
    z: pitched.z + camera.distance,
  };
}

function projectViewPoint(
  v: Vec3,
  options: {
    width: number;
    height: number;
    focal: number;
    near: number;
  },
): Vec2 | null {
  if (v.z <= options.near) return null;
  const f = options.focal / v.z;
  return {
    x: options.width * 0.5 + v.x * f,
    y: options.height * 0.5 - v.y * f,
  };
}

function getProjectedBounds(points: Array<Vec2 | null>) {
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let found = false;

  for (const point of points) {
    if (!point) continue;
    found = true;
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }

  if (!found) return null;
  return {
    minX,
    maxX,
    minY,
    maxY,
  };
}

function getFitTransform(
  points: Array<Vec2 | null>,
  width: number,
  height: number,
  padding: number,
) {
  const bounds = getProjectedBounds(points);
  if (!bounds) {
    return {
      sourceCenterX: width * 0.5,
      sourceCenterY: height * 0.5,
      targetCenterX: width * 0.5,
      targetCenterY: height * 0.5,
      scale: 1,
    };
  }

  const boundsW = Math.max(1e-4, bounds.maxX - bounds.minX);
  const boundsH = Math.max(1e-4, bounds.maxY - bounds.minY);
  const innerW = Math.max(1, width - padding * 2);
  const innerH = Math.max(1, height - padding * 2);
  const scale = Math.min(innerW / boundsW, innerH / boundsH);

  return {
    sourceCenterX: (bounds.minX + bounds.maxX) * 0.5,
    sourceCenterY: (bounds.minY + bounds.maxY) * 0.5,
    targetCenterX: width * 0.5,
    targetCenterY: height * 0.5,
    scale,
  };
}

function applyFitTransform(
  points: Array<Vec2 | null>,
  fit: {
    sourceCenterX: number;
    sourceCenterY: number;
    targetCenterX: number;
    targetCenterY: number;
    scale: number;
  },
): Array<Vec2 | null> {
  return points.map((point) => {
    if (!point) return null;
    return {
      x: (point.x - fit.sourceCenterX) * fit.scale + fit.targetCenterX,
      y: (point.y - fit.sourceCenterY) * fit.scale + fit.targetCenterY,
    };
  });
}

function viewToProjection(
  mesh: Mesh,
  options: {
    width: number;
    height: number;
    focal: number;
    near: number;
  },
): {
  cols: number;
  rows: number;
  points: Array<Vec2 | null>;
} {
  const points: Array<Vec2 | null> = [];

  for (const v of mesh.vertices) {
    if (v.z <= options.near) {
      points.push(null);
      continue;
    }

    const f = options.focal / v.z;
    points.push({
      x: options.width * 0.5 + v.x * f,
      y: options.height * 0.5 - v.y * f,
    });
  }

  return {
    cols: mesh.cols,
    rows: mesh.rows,
    points,
  };
}

function projectionToCanvas(
  ctx: CanvasRenderingContext2D,
  projected: {
    cols: number;
    rows: number;
    points: Array<Vec2 | null>;
  },
  style: {
    stroke: string;
    rowWidth: number;
    colWidth: number;
    colStep: number;
  },
) {
  const pointAt = (row: number, col: number) => projected.points[row * projected.cols + col] ?? null;

  ctx.strokeStyle = style.stroke;
  ctx.lineWidth = style.rowWidth;

  for (let row = 0; row < projected.rows; row += 1) {
    let started = false;
    ctx.beginPath();
    for (let col = 0; col < projected.cols; col += 1) {
      const p = pointAt(row, col);
      if (!p) continue;
      if (!started) {
        started = true;
        ctx.moveTo(p.x, p.y);
      } else {
        ctx.lineTo(p.x, p.y);
      }
    }
    if (started) ctx.stroke();
  }

  ctx.lineWidth = style.colWidth;
  for (let col = 0; col < projected.cols; col += Math.max(1, style.colStep)) {
    let started = false;
    ctx.beginPath();
    for (let row = 0; row < projected.rows; row += 1) {
      const p = pointAt(row, col);
      if (!p) continue;
      if (!started) {
        started = true;
        ctx.moveTo(p.x, p.y);
      } else {
        ctx.lineTo(p.x, p.y);
      }
    }
    if (started) ctx.stroke();
  }
}

function drawHighlightedRow(
  ctx: CanvasRenderingContext2D,
  projected: {
    cols: number;
    rows: number;
    points: Array<Vec2 | null>;
  },
  rowIndex: number,
  color: string,
) {
  const row = clamp(rowIndex, 0, projected.rows - 1);
  let started = false;

  ctx.beginPath();
  for (let col = 0; col < projected.cols; col += 1) {
    const p = projected.points[row * projected.cols + col] ?? null;
    if (!p) continue;
    if (!started) {
      started = true;
      ctx.moveTo(p.x, p.y);
    } else {
      ctx.lineTo(p.x, p.y);
    }
  }

  if (!started) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.shadowBlur = 10;
  ctx.shadowColor = color;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawBoundsBox(
  ctx: CanvasRenderingContext2D,
  projected: {
    points: Array<Vec2 | null>;
  },
  color: string,
) {
  const edges: Array<[number, number]> = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];

  ctx.save();
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;

  for (const [a, b] of edges) {
    const pa = projected.points[a];
    const pb = projected.points[b];
    if (!pa || !pb) continue;
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
  }

  ctx.restore();
}
