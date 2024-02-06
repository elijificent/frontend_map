"use client";

import { get } from "http";
import { use, useEffect, useState } from "react";


type TerrainType = "ocean" | "sand" | "grass" | "forest" | "stone";
type StyleMode = "unselected" | "selected" | "hovered" | "hover-neighbors";
type TileProps = {
  isHex: boolean;
  possibleTypes: TerrainType[];
  row: number;
  column: number;
  styleMode: StyleMode;
  setHoverTileCallback?: (column: number, row: number, mode: "enter" | "leave") => void;
  setClickTileCallback?: (column: number, row: number) => void;
};
function Tile({ possibleTypes, column, row, styleMode, setHoverTileCallback, setClickTileCallback }: TileProps) {
  function getTileClass() {
    if (possibleTypes.length === 1) {
      return `tile-${possibleTypes[0]}`;
    }

    return `tile-quantum`
  }

  function getTileStyleClass() {
    if (!styleMode || styleMode === "unselected") {
      return "";
    }

    return `tile-${styleMode}`;
  }

  function onMouseEnter() {
    if (setHoverTileCallback) {
      setHoverTileCallback(column, row, "enter");
    }
  }

  function onMouseLeave() {
    if (setHoverTileCallback) {
      setHoverTileCallback(column, row, "leave");
    }
  }

  function onClick() {
    if (setClickTileCallback) {
      setClickTileCallback(column, row);
    }
  }

  return (
    <div className={`tile p-2 border ${getTileStyleClass()}`} onMouseEnter={() => onMouseEnter()} onClick={() => onClick()} onMouseLeave={() => onMouseLeave()}>
      <p>
        {getTileClass() === "tile-quantum" ? "???" : ""}
      </p>
    </div>
  )
}

type Coordinate = {
  x: number;
  y: number;
};

type GridProps = {
  isHex: boolean;
  rows: number;
  cols: number;
  paintColor: TerrainType | null;
};

export function Grid({ isHex, rows, cols, paintColor }: GridProps) {
  const [grid, setGrid] = useState<TileProps[]>([]);
  const [currentHoverTile, setCurrentHoverTile] = useState<Coordinate | null>(null);
  const [selectedTile, setSelectedTile] = useState<Coordinate | null>(null);

  function getCol(col: number): TileProps[] {
    const colArray: TileProps[] = [];
    for (let i = 0; i < rows; i++) {
      colArray.push(grid[i * cols + col]);
    }
    return colArray;
  }

  function getCols(): TileProps[][] {
    if (grid.length === 0) {
      return [];
    }

    const colArray: TileProps[][] = [];
    for (let i = 0; i < cols; i++) {
      colArray.push(getCol(i));
    }
    return colArray;
  }

  function hoverCallback(column: number, row: number, mode: "enter" | "leave") {
    if (mode === "leave") {
      setCurrentHoverTile(null);
      // unselectAllTiles();
      return;
    }

    setCurrentHoverTile({ x: column, y: row });
  }

  function clickCallback(column: number, row: number) {
    setSelectedTile({ x: column, y: row });
  }

  function mouseLeftGrid() {
    unselectAllTiles();
  }

  function unselectAllTiles() {
    const newGrid = grid.slice();
    newGrid.forEach((tile) => {
      if (tile.styleMode !== "selected") {
        tile.styleMode = "unselected";
      }
    });
    setGrid(newGrid);
  }

  useEffect(() => {
    if (currentHoverTile) {
      if (currentHoverTile.x === selectedTile?.x && currentHoverTile.y === selectedTile?.y) {
        unselectAllTiles();
        return;
      }

      const newGrid = grid.slice();
      newGrid.forEach((tile) => {
        if (tile.styleMode !== "selected") {
          tile.styleMode = "unselected";
        }
      });
      newGrid[currentHoverTile.y * cols + currentHoverTile.x].styleMode = "hovered";

      setGrid(newGrid);
    }
  }, [currentHoverTile]);

  useEffect(() => {
    if (selectedTile) {
      const newGrid = grid.slice();
      newGrid.forEach((tile) => {
        if (tile.styleMode !== "selected") {
          tile.styleMode = "unselected";
        }
      });
      newGrid[selectedTile.y * cols + selectedTile.x].styleMode = "selected";

      setGrid(newGrid);
    } else {
      const newGrid = grid.slice();
      newGrid.forEach((tile) => {
        tile.styleMode = "unselected";
      });
      setGrid(newGrid);
    }
  }, [selectedTile]);


  useEffect(() => {
    const newGrid: TileProps[] = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        newGrid.push({
          possibleTypes: ["ocean", "sand", "grass", "forest", "stone"],
          column: j,
          row: i,
          styleMode: "unselected",
          setHoverTileCallback: hoverCallback,
          setClickTileCallback: clickCallback,
          isHex: isHex,
        });
      }
    }
    setGrid(newGrid);
  }, [isHex, rows, cols]);



  useEffect(() => {
    if (selectedTile) {
    }
  }, [paintColor]);

  return (
    <div>
      <div className="flex flex-row map-grid" onMouseLeave={() => mouseLeftGrid()}>
        {getCols().map((col, index) => {
          return (
            <div key={index} className={`flex flex-col ${isHex ? 'map-col' : ''}`}>
              {col.map((tile, index) => {
                if (!tile) {
                  return null;
                }

                return (
                  <Tile key={index} possibleTypes={tile.possibleTypes} column={tile.column} row={tile.row} setHoverTileCallback={tile.setHoverTileCallback} isHex={tile.isHex} setClickTileCallback={tile.setClickTileCallback} styleMode={tile.styleMode} />
                );
              })}
            </div>
          );
        })}
      </div>

      <div>
        <p>Hovering over {currentHoverTile?.x}, {currentHoverTile?.y}</p>
        <p>Selected tile {selectedTile?.x}, {selectedTile?.y}</p>
      </div>
      <div>
        <p>Clear selected tile</p>
        <button onClick={() => setSelectedTile(null)}>Clear</button>
      </div>
    </div>  
  );
}

type GridEditMode = "view" | "edit" | "load";
type EditPanelProps = {
  isHex: boolean;
  setIsHex: (isHex: boolean) => void;
  rows: number;
  setRows: (rows: number) => void;
  cols: number;
  setCols: (cols: number) => void;
  editMode: GridEditMode;
  setEditMode: (mode: GridEditMode) => void;
  paintColor: TerrainType | null;
  setPaintColor: (color: TerrainType | null) => void;
};

function GridEditPanel({ isHex, setIsHex, rows, setRows, cols, setCols, editMode, setEditMode, paintColor, setPaintColor }: EditPanelProps) {
  return (
    <div className="grid-controls">
      <div className="control-panel">
        <div>
          <label>
            <input type="checkbox" checked={isHex} onChange={(e) => setIsHex(e.target.checked)} />
            Hex Grid
          </label>
        </div>
        <div>
          <label>
            Rows
            <input type="number" value={rows} onChange={(e) => setRows(parseInt(e.target.value))} />
          </label>
        </div>
        <div>
          <label>
            Columns
            <input type="number" value={cols} onChange={(e) => setCols(parseInt(e.target.value))} />
          </label>
        </div>
        <div>
          <label>
            <input type="radio" name="mode" value="view" checked={editMode === "view"} onChange={() => setEditMode("view")} />
            View
          </label>
          <label>
            <input type="radio" name="mode" value="edit" checked={editMode === "edit"} onChange={() => setEditMode("edit")} />
            Edit
          </label>
        </div>
      </div>

      {editMode === "edit" ? <EditColorPanel paintColor={paintColor} setPaintColor={setPaintColor} /> : null}

    </div>
  )
}

type EditColorPanelProps = {
  paintColor: TerrainType | null;
  setPaintColor: (color: TerrainType | null) => void;
}

function EditColorPanel({ paintColor, setPaintColor }: EditColorPanelProps) {
  // Edit tile when clicked
  return (
    <div className="edit-color-panel">
      <label>
        <input type="radio" name="color" value="ocean" checked={paintColor === "ocean"} onChange={() => setPaintColor("ocean")} />
        Ocean
      </label>
      <label>
        <input type="radio" name="color" value="sand" checked={paintColor === "sand"} onChange={() => setPaintColor("sand")} />
        Sand
      </label>
      <label>
        <input type="radio" name="color" value="grass" checked={paintColor === "grass"} onChange={() => setPaintColor("grass")} />
        Grass
      </label>
      <label>
        <input type="radio" name="color" value="forest" checked={paintColor === "forest"} onChange={() => setPaintColor("forest")} />
        Forest
      </label>
      <label>
        <input type="radio" name="color" value="stone" checked={paintColor === "stone"} onChange={() => setPaintColor("stone")} />
        Stone
      </label>
      <label>
        <input type="radio" name="color" value="null" checked={paintColor === null} onChange={() => setPaintColor(null)} />
        Erase
      </label>
    </div>
  )

}

export function GridEditor() {
  const [isHex, setIsHex] = useState(false);
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [mode, setMode] = useState<GridEditMode>("view");
  const [currentPaintTile, setCurrentPaintTile] = useState<TerrainType | null>(null);

  return (
    <div>
      <GridEditPanel isHex={isHex} setIsHex={setIsHex} rows={rows} setRows={setRows} cols={cols} setCols={setCols} editMode={mode} setEditMode={setMode}
        paintColor={currentPaintTile} setPaintColor={setCurrentPaintTile}
      />

      <Grid isHex={isHex} rows={rows} cols={cols} paintColor={currentPaintTile} />
    </div>
  );
}