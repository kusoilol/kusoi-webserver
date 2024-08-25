// parsing
__readLineIndexer = 0
function readLine(logs) {
    if (__readLineIndexer < logs.length) {
        console.log(__readLineIndexer, logs[__readLineIndexer])
        return logs[__readLineIndexer++]
    }
    return ""
}

function readMove(logs) {
    p1 = getRCD(readLine(logs))
    p2 = getRCD(readLine(logs))

    bulletsNum = Number(readLine(logs))
    bullets = []

    for (i = 0; i < bulletsNum; i++) {
        bullets.push(getRCD(readLine(logs)))
    }

    return {
        type: "move",
        p: [p2, p1],
        bullets: bullets,
    }
}

function readSetup(logs) {
    fld = []
    fldHeight = Number(readLine(logs).split(" ")[0])
    for (i = 0; i < fldHeight; i++) {
        fld.push(readLine(logs))
    }
    return fld
}

function parseLogs(logs) {
    __readLineIndexer = 0;
    var res = []
    var fld = []

    __setupCount = 0
    player = 1

    while (true) {
        cmd = readLine(logs).split(" ")
        if (["fw", "bw", "rr", "rl", "sh", "ff"].includes(cmd[0])) {
            continue
        }

        player = (player + 1) % 2

        if (cmd[0] == "setup") {
            fld = readSetup(logs)
            tmp = readMove(logs)

            if (__setupCount == 0) {
                if (player == 0) {
                    [tmp.p[0], tmp.p[1]] = [tmp.p[1], tmp.p[0]]
                }
                res.push(tmp)
            }
        }

        else if (cmd[0] == "data") {
            tmp = readMove(logs)
            if (player == 1) {
                res.push(tmp)
            }
        }

        else if (cmd[0] == "win" || cmd[0] == "draw") {
            res.push({
                type: "end",
                res: cmd[0],
                who: Number(cmd[1]),
            })
            break
        }
    }

    return [fld, res]
}

// init
var cnv = document.getElementById("canvas")
var ctx = cnv.getContext("2d")

var [field, moves] = parseLogs(gameLog)

const cellsVer = field.length
const cellsHor = field[0].length

cnv.width = 400
cnv.height = 400

cnv.width += cellsHor - (cnv.width % cellsHor)
cnv.height += cellsVer - (cnv.height % cellsVer)
const cellSize = Math.min(cnv.width / cellsHor, cnv.height / cellsVer)

///////////////////////////////////////

images = {
    tank: [{
        up: new Image(),
        down: new Image(),
        left: new Image(),
        right: new Image(),
    }, {
        up: new Image(),
        down: new Image(),
        left: new Image(),
        right: new Image(),
    }],
    bullet: {
        up: new Image(),
        down: new Image(),
        left: new Image(),
        right: new Image(),
    },
    wall: new Image(),
    boom: {
        1: new Image(),
        2: new Image(),
        3: new Image(),
    }
}

// load pics
images.wall.src = "src/sprites/wall.png"
images.boom.src = "src/sprites/wall.png"
for (i = 1; i <= 3; i++) {
    images.boom[i].src = "src/sprites/bullet_explosion_" + i + ".png"
}
for (dir in images.bullet) {
    for (i = 0; i < 2; i++) {
        images.tank[i][dir].src = "src/sprites/tank_power_" + dir + "_c0_t1" + ["", "_f"][i] + ".png"
    }
    images.bullet[dir].src = "src/sprites/bullet_" + dir + ".png"
}

// init
ctx.fillStyle = "black"
ctx.fillRect(0, 0, cnv.width, cnv.height)
document.getElementById("status").innerText = ""


// funcs
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function getCoords(r, c) {
    return [r * cellSize, c * cellSize]
}

function drawWall(r, c) {
    [x, y] = getCoords(r, c)
    ctx.drawImage(images.wall, x, y, cellSize, cellSize)
}

function drawNothing(r, c) {
    [x, y] = getCoords(r, c)
    ctx.fillStyle = "black"
    ctx.fillRect(x, y, cellSize, cellSize)
}

function drawTank(obj, p) {
    [x, y] = getCoords(obj.r, obj.c)
    p -= 1
    ctx.drawImage(images.tank[p][obj.d], x, y, cellSize, cellSize)
}

function drawBullet(obj) {
    [x, y] = getCoords(obj.r, obj.c)
    let bulletSize = images.bullet[obj.d].width
    ctx.drawImage(images.bullet[obj.d], x + cellSize * 0.5 - bulletSize * 0.5, y + cellSize * 0.5 - bulletSize * 0.5, bulletSize, bulletSize)
}

async function drawBoom(r, c, frame = 1) {
    [x, y] = getCoords(r, c)
    if (frame > 3) {
        ctx.fillStyle = "black"
        ctx.fillRect(x, y, cellSize, cellSize)
        return
    }
    console.log(r, c, frame)
    ctx.drawImage(images.boom[frame], x, y, cellSize, cellSize)
    setTimeout(drawBoom, 75, r, c, frame + 1)
}

function drawField() {
    for (i = 0; i < cellsVer; i++) {
        for (j = 0; j < cellsHor; j++) {
            switch (field[i][j]) {
                case '#': {
                    drawWall(j, i)
                    break
                }
                case '.': {
                    drawNothing(j, i)
                    break
                }
            }
        }
    }
}

function getRCD(line) {
    data = line.split(" ")
    res = {
        r: Number(data[0]),
        c: Number(data[1]),
        d: data[2],
    }
    return res
}


async function simulate() {
    document.getElementById("status").innerText = "Играем..."

    for (turn = 0; turn < moves.length; turn++) {
        console.log(moves[turn])

        if (moves[turn].type == "end") {
            if (moves[turn].res == "win") {
                let winner = moves[turn].who - 1
                let looser = 1 - winner
                document.getElementById("status").innerText = ["Белый", "Красный"][winner] + " победил!"
                if (turn > 0) {
                    drawBoom(moves[turn - 1].p[looser].r, moves[turn - 1].p[looser].c)
                }
            } else if (moves[trun].res == "draw") {
                document.getElementById("status").innerText = "Ничья!"
                drawBoom(moves[turn - 1].p[0].r, moves[turn - 1].p[0].c)
                drawBoom(moves[turn - 1].p[1].r, moves[turn - 1].p[1].c)
            }
            break
        }

        drawField()
        drawTank(moves[turn].p[0], 1)
        drawTank(moves[turn].p[1], 2)

        for (i = 0; i < moves[turn].bullets.length; i++) {
            drawBullet(moves[turn].bullets[i])
        }

        await sleep(500);
    }
}

var startButton = document.getElementById("start-button")
startButton.addEventListener("click", simulate);