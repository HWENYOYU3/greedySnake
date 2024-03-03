const canvas = document.getElementById("game-area");
const ctx = canvas.getContext("2d");

// snake 每個區塊佔據的大小
const unit = 20;
//遊戲區塊內總共有幾個row (20), column (20)
const row = canvas.width / unit;
const column = canvas.height / unit;

//array 中的每個元素都是一個 object, object 負責儲存每個區塊的(x,y)
/* 假設起始狀態為
  |------------|     
  |  0001      |
  |            |
  |            |
  |------------|
  1表示貪食蛇頭, 0表示貪食蛇身體
 */

let snake = [{ x: 100, y: 20 }, { x: 80, y: 20 }, { x: 60, y: 20 }, { x: 40, y: 20 }];


//以下為方向控制
//預設蛇的移動方向往下
let direction = "down";
window.addEventListener("keydown", changeDirection);

function changeDirection(e) {
  //捕捉我們需要的 key 值
  // console.log(`you keydown the ${e.key}`);
  if (e.key == "ArrowUp" && direction != "down") {
    direction = "up";
  } else if (e.key == "ArrowDown" && direction != "up") {
    direction = "down";
  } else if (e.key == "ArrowLeft" && direction != "right") {
    direction = "left";
  } else if (e.key == "ArrowRight" && direction != "left") {
    direction = "right";
  }

  // console.log(`current direction is ${direction}`);


  //在下次畫時, 不重複執行keydown
  window.removeEventListener("keydown", changeDirection);
}

//分數產生
//分數的位置(x, y), 畫出 以及 不重複功能

/*
測試數字是否落在 0-19
console.log(Math.floor((Math.random() * column)));
*/

class Points {
  //使用 Math 裡的 random() 隨機產生 [0,1) 的值, floor()無條件捨去
  constructor() {
    this.x = Math.floor((Math.random() * column)) * unit;
    this.y = Math.floor((Math.random() * row)) * unit;
  }
  drawingPoints() {
    ctx.fillStyle = "lightblue";
    ctx.strokeStyle = "white";
    ctx.fillRect(this.x, this.y, unit, unit);
    ctx.strokeRect(this.x, this.y, unit, unit);
  }


  //判斷產生分數的位置是否重疊於蛇的全身
  selectingLoaction() {
    let stack = false;
    let newpointsX;
    let newpointsY;


    //檢查分數產生的位置是否重疊於蛇的身體
    function checkStack(newpointsX, newpointsY) {
      for (let i = 0; i < snake.length; i++) {
        //如果重疊, 則stack的值為true => 繼續進行do-while loop
        if (newpointsX == snake[i].x && newpointsY == snake[i].y) {
          stack = true;
          return;
        } else {
          stack = false;
        }
      }
    }

    do {
      console.log('重新產生新位置');
      newpointsX = Math.floor((Math.random() * column)) * unit;
      newpointsY = Math.floor((Math.random() * row)) * unit;
      checkStack(newpointsX, newpointsY);

    } while (stack);

    //脫離迴圈, 代表所選擇的位置沒有重疊
    this.x = newpointsX;
    this.y = newpointsY;
  }
}

let pts = new Points;
//console.log(pts);

//分數紀錄

//目前分數
let score = 0;
document.getElementById("current-score").innerText = `Cuurent's scroe is ...  ${score}  pts`;
//歷史最高分
//先看看瀏覽器內的local storage有沒有存在最高紀錄
function isHighestScore() {
  // console.log(localStorage.getItem("highestScore"));
  if (localStorage.getItem("highestScore") == null) {
    highestScore = 0;
  } else {
    highestScore = Number(localStorage.getItem("highestScore"));
  }
}

//判斷分數是否大於歷史最高分
function setHighestScore(score) {
  if (score > highestScore) {
    localStorage.setItem("highestScore", score);
    highestScore = score;
  }
}

let highestScore;
isHighestScore();
document.getElementById("highest-score").innerText = `Historic records is ...  ${highestScore} pts`;


/*畫蛇函式*/
function drawingSnake() {
  //判斷遊戲是否結束 => 蛇的頭是否觸碰到蛇的身體
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x == snake[0].x && snake[i].y == snake[0].y) {
      clearInterval(startGame);
      window.alert(`The game is over, your score is "${score}"`);
      restartBtn.style.display = "block";
      stopBtn.style.display = "none";
    }
  }


  //重新填滿畫布
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //console.log("目前蛇頭位置為" + snake[0].x + "," +snake[0].y);
  //console.log(`snake is drawing...`);


  //畫出分數位置
  pts.drawingPoints();
  //console.log(`目前分數的位置為(${pts.x}),(${pts.y})`);


  //畫蛇 drawing snake
  for (let i = 0; i < snake.length; i++) {

    //蛇的顏色確認, 頭為白色, 身體為紅色
    if (i == 0) {
      ctx.fillStyle = "white";
    } else {
      ctx.fillStyle = "red";
    }


    //先確認蛇是否有撞牆, 如果撞牆則更新其位置, 再畫蛇
    if (snake[i].x >= canvas.width) {
      snake[i].x = 0;
    } else if (snake[i].x < 0) {
      snake[i].x = canvas.width;
    } else if (snake[i].y >= canvas.height) {
      snake[i].y = 0;
    } else if (snake[i].y < 0) {
      snake[i].y = canvas.height;
    }

    //開始畫蛇
    ctx.strokeStyle = "white";
    ctx.fillRect(snake[i].x, snake[i].y, unit, unit);
    ctx.strokeRect(snake[i].x, snake[i].y, unit, unit);
  }


  //以下為蛇的座標改變

  let currentX = snake[0].x;
  let currentY = snake[0].y;
  //console.log(`目前蛇頭的座標${currentX}, ${currentY}`);

  //蛇的移動方向, 決定下一次執行的位置
  /*  right => snake.x + unit 
    left => snake.x - unit
    up => snake.y - unit
    down => snake.y - unit
  */

  if (direction == "down") {
    currentY += unit;
  } else if (direction == "up") {
    currentY -= unit;
  } else if (direction == "left") {
    currentX -= unit;
  } else if (direction == "right") {
    currentX += unit;
  }

  let newHead = { x: currentX, y: currentY };

  //console.log(`移動後的蛇頭座標${newHead.x}, ${newHead.y},`);


  /*如果蛇吃到分數(蛇頭的位置 == 分數的位置)
  1.蛇的長度增加 => 只unshift增加, 不pop捨去
  2.重新選擇一個新的分數位置, 並畫出*/
  if (newHead.x == pts.x && newHead.y == pts.y) {
    snake.unshift(newHead);

    //目前分數更新
    score++;
    document.getElementById("current-score").innerText = `Current's score is ...  ${score}  pts`;
    //console.log(`目前分數為${score}`);

    //判斷目前分數是否屬於歷史最高分, 有則取代
    setHighestScore(score);
    document.getElementById("highest-score").innerText = `Historic records is ...  ${highestScore} pts`;

    //2.重新選定位置
    pts.selectingLoaction();


  } else {
    //將該座標加入snake array
    snake.unshift(newHead);

    //Array尾部的元素(蛇尾)去除
    snake.pop();
  }

  //重新加入keydown事件
  window.addEventListener("keydown", changeDirection);

}
let startGame;


//按鈕設定
let startBtn = document.getElementById("start-btn");
startBtn.addEventListener("click", () => {
  startGame = setInterval(drawingSnake, 50);
  startBtn.style.display = "none";
  stopBtn.style.display = "block";
})

let stopBtn = document.getElementById("stop-btn");
stopBtn.addEventListener("click", () => {
  clearInterval(startGame);
  startBtn.style.display = "block";
  stopBtn.style.display = "none";
  window.removeEventListener("keydown", changeDirection);
})

let restartBtn = document.getElementById("restart-btn");
restartBtn.addEventListener("click", () => {
  window.location.reload();
})
