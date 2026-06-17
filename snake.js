const KEY_TO_DIR = {
  "UP": { dx: 0, dy: -1 },
  "DOWN": { dx: 0, dy: 1 },
  "LEFT": { dx: -1, dy: 0 },
  "RIGHT": { dx: 1, dy: 0 },
};

const DIMENSIONS = { width: 80, height: 24 };
const INIT_GAME = {
  dimensions: DIMENSIONS,
  direction: KEY_TO_DIR.UP,
  snake: [{ x: 40, y: 12 }],
  apples: range(15).map(() => randomApple(DIMENSIONS)),
};

function random(n) {
  return Math.floor(Math.random() * n);
}

function randomApple(dimensions) {
  return { x: random(dimensions.width), y: random(dimensions.height) };
}

function onKey(game, key) {
  return key in KEY_TO_DIR ? { ...game, direction: KEY_TO_DIR[key] } : game;
}

function gameToFrame({ dimensions, apples, snake }) {
  for (let i = 0; i < snake.length; i++) {
    const { x, y } = snake[i];
    if (x < 0 || x >= dimensions.width || y < 0 || y >= dimensions.height) {
      return "EXIT";
    }
  }
  //console.count("FRAME")
  const board = range(dimensions.height).map(() =>
    range(dimensions.width).fill(" ")
  );
  apples.forEach(({ x, y }) => {
    board[y][x] = "*";
  });
  //console.log(board)
  snake.forEach(({ x, y }) => {
    board[y][x] = "#";
  });
  return board.map((row) => row.join("")).join("\n");
}

function range(n) {
  return Array(n).fill(0);
}

function nextGame(game) {
  //const apple = game.apples.indexOf(({x, y}) => {
  //const head = game.snake.at(0)
  //return head.x === x && head.y === y
  //})
  const snake = game.snake.map(({ x, y }) => ({
    x: x + game.direction.dx,
    y: y + game.direction.dy,
  }));
  return { ...game, snake };
}

let game = INIT_GAME;
setInterval(() => {
  game = nextGame(game);
  process.stdout.write(gameToFrame(game));
}, 1000);

process.stdin.on("data", (chunk) => {
  const x = chunk.toString("ascii");
  game = onKey(game, chunk.toString("ascii"));
});
