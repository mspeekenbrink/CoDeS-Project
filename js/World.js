const TILE_W = 100;
const TILE_H = 100;
const TILE_COLS = 220;
const TILE_ROWS = 220;

var trainingPhase = true;

rowParameters = new Array(TILE_ROWS);
columnParameters = new Array(TILE_COLS);

plantRow = new Array(TILE_ROWS);
soilColumn = new Array(TILE_COLS);

payoffRow = new Array(TILE_ROWS);
payoffColumn = new Array(TILE_COLS);

exploredRow = new Array(TILE_ROWS);
exploredColumn = new Array(TILE_COLS);

expectedPayoff = new Array(TILE_COLS);
randomColumn = new Array(TILE_COLS);

function generateParameters() {
    for (var i=0; i<TILE_COLS; i++) {
        columnParameters[i] = jStat.beta.sample(1,2);
    }
    for (var j=0; j<TILE_ROWS; j++) {
        rowParameters[j] = jStat.beta.sample(2,1);
    }
}

generateParameters();

// for(var i = 0, value = 1234, size = 1000, array = new Array(1000); i < size; i++) array[i] = value;


//console.log("rowParameters", rowParameters);
//console.log("columnParameters", columnParameters);

function generateWorld() {
    for (var i=0; i<TILE_COLS; i++) {
        var soilSeed = columnParameters[i] * 5;
        soilColumn[i] = Math.floor(soilSeed);
        payoffColumn[i] = 0;
        exploredColumn[i] = 0;
    }
    for (var j=0; j<TILE_ROWS; j++) {
        var plantSeed = rowParameters[j] * 5;
        plantRow[j] = Math.floor(plantSeed);
        payoffRow[j] = 0;
        exploredRow[j] = 0;
    }
}

function measureWorld() {

    for (var i=0; i<TILE_COLS; i++) {
        randomColumn[i] = Math.random();
        expectedPayoff[i] = columnParameters[i] * rowParameters[i];
    }
    var totalPayoff = jStat.sum(expectedPayoff);
    var meanPayoff = totalPayoff / expectedPayoff.length;

    var totalRandom = jStat.sum(randomColumn);
    var meanRandom = totalRandom / randomColumn.length;

    console.log("MEAN PAYOFF :", meanPayoff);
    console.log("MEAN RANDOM :", meanRandom);
}


generateWorld();



function getParameters() {
    posX = Math.floor((trackerX + shiftedLeft)/TILE_W);
    posY = Math.floor((trackerY + shiftedUp)/TILE_H);
}



function createGrid() {
    var newRow = new Array(TILE_COLS);

    for (j=0; j<newRow.length; j++) {
        var newCol = new Array(TILE_ROWS);
        for (i=0; i<newCol.length; i++) {
            newCol[i] = [0];
        }
        newRow[j] = newCol
    }
    return newRow;

}

var newGrid = createGrid();


var tileGrid = [];


function isTileAtCoord(TileRow, TileCol) {
    if (tileGrid[TileRow] !== undefined) {
        if (tileGrid[TileRow][TileCol] !== undefined) {
            return true;
        }
    }
    return false;
}


function isExplored(TileRow, TileCol) {

    if (exploredRow[TileRow] === 1){

        return 0;
    }
    else if (payoffRow[TileRow] * payoffColumn[TileCol] === 1){
        return 0;
    }
    else {
        return 0;
    }
}

function getInfo(TileRow, TileCol) {
    var infoCol = exploredColumn[TileCol];
    var infoRow = exploredRow[TileRow];

    var infoLevelCol = getInfoLevel(infoCol);
    var infoLevelRow = getInfoLevel(infoRow);


    var qualityCol = getQuality(payoffColumn[TileCol], infoCol);
    var qualityRow = getQuality(payoffRow[TileRow], infoRow);


    return [infoLevelCol, infoLevelRow, qualityCol, qualityRow];
}


function getInfoLevel(rowOrCol) {
    if (rowOrCol === 0) {
        return 3;
    }
    else if (rowOrCol < 4) {
        return 2;
    }
    else if (rowOrCol >= 4) {
        return 1;
    }
}


function getQuality(timesPotato, timesExplored) {
    var fraction = timesPotato / timesExplored;

    if (timesExplored === 0){
        return 2;
    }
    else if (fraction <= 0.2) {
        return 0;
    }
    else if (fraction <= 0.4) {
        return 1;
    }
    else if (fraction <= 0.6) {
        return 2;
    }
    else if (fraction <= 0.8) {
        return 3;
    }
    else  {
        return 4;
    }
}




function drawOnlyTilesOnScreen() {
    // what are the top-left most row and col visible on canvas?
    var cameraLeftMostCol = Math.floor(camPanX / TILE_W);
    var cameraTopMostRow = Math.floor(camPanY / TILE_H);
    // how many rows and columns of tiles fit on one screenful of area?
    var colsThatFitOnScreen = Math.floor(CANVAS_W / TILE_W);
    var rowsThatFitOnScreen = Math.floor(CANVAS_H / TILE_H);

    // finding the rightmost and bottommost tiles to draw.
    // the +1 on each pushes the new tile popping in off visible area
    var cameraRightMostCol = cameraLeftMostCol + colsThatFitOnScreen + 1;
    var cameraBottomMostRow = cameraTopMostRow + rowsThatFitOnScreen + 1;

    for(var eachCol=cameraLeftMostCol; eachCol<cameraRightMostCol; eachCol++) {

        for(var eachRow=cameraTopMostRow; eachRow<cameraBottomMostRow; eachRow++) {

			//if (isTileAtCoord(eachRow, eachCol)) {
            if (trainingPhase) {
                var arrayIndex = tileGrid[eachCol][eachRow];

                var drawX = eachCol * TILE_W;
                var drawY = eachRow * TILE_H;

                var infoType = getInfo(eachRow, eachCol);
                var soilParameter = infoType[2];
                var plantParameter = infoType[3];

                //var soilType = "S" + arrayIndex[2] + tileTypes[arrayIndex[0]];
                var soilType = "S"+ infoType[0] + tileTypes[soilParameter];

                //console.log("SOIL TYPE", soilType);
                // var plantType = "P" + arrayIndex[3] + tileTypes[arrayIndex[1]];
                var plantType = "P" + infoType[1] + tileTypes[plantParameter];
                var soilImg = tilePics[soilType];
                var plantImg = tilePics[plantType];
                //var soilImg = tilePics[arrayIndex[0]];
                //var plantImg = tilePics[arrayIndex[1]];

                if (arrayIndex[0] === 0) {
                    canvasContext.drawImage(soilImg, drawX, drawY, TILE_W, TILE_H);
                    canvasContext.drawImage(plantImg, drawX + 20, drawY + 20, TILE_W*0.6, TILE_H*0.6);
                }
                else {
                    if (arrayIndex[0] === 1) {
                        canvasContext.drawImage(tilePics["S00"], drawX, drawY, TILE_W, TILE_H);
                    }
                    else if (arrayIndex[0] === 3) {
                        canvasContext.drawImage(tilePics["SXX"], drawX, drawY, TILE_W, TILE_H);
                    }
                    else if (arrayIndex[0] === 5) {
                        canvasContext.drawImage(tilePics["W"], drawX, drawY, TILE_W, TILE_H);
                        canvasContext.drawImage(tilePics["N"], drawX + 20, drawY + 20, TILE_W*0.6, TILE_H*0.6);
                    }
                    else if (arrayIndex[0] === 7) {
                        canvasContext.drawImage(soilImg, drawX, drawY, TILE_W, TILE_H);
                        canvasContext.drawImage(tilePics["R1"], drawX, drawY, TILE_W, TILE_H);
                    }
                    else if (arrayIndex[0] === 8) {
                        canvasContext.drawImage(soilImg, drawX, drawY, TILE_W, TILE_H);
                        canvasContext.drawImage(tilePics["R2"], drawX, drawY, TILE_W, TILE_H);
                    }
                    else if (arrayIndex[0] === 9) {
                        canvasContext.drawImage(soilImg, drawX, drawY, TILE_W, TILE_H);
                        canvasContext.drawImage(tilePics["R3"], drawX, drawY, TILE_W, TILE_H);
                    }
                }
            }
        }
    }
}

