'use strict';

var Cloud = {
  WIDTH: 420,
  HEIGHT: 270,
  X: 100,
  Y: 10,
  GAP: 10,
  FILL_COLOR: '#ffffff',
  STROKE_COLOR: '000000'
};

var Shadow = {
  X: Cloud.X + Cloud.GAP,
  Y: Cloud.Y + Cloud.GAP,
  FILL_COLOR: 'rgba(0, 0, 0, 0.7)'
};

var Bar = {
  WIDTH: 40,
  HEIGHT: 150,
  GAP: 50,
  PLAYER_FILL_COLOR: 'rgba(255, 0, 0, 1)'
};

var Text = {
  DATA: 'Ура вы победили! Список результатов:',
  BASELINE: 'hanging',
  ALIGN: 'center',
  STYLE: '16px PT Mono',
  LINE_HEIGHT: 20,
  FILL_COLOR: '#000000'
};

var MAX_WIDTH = 200;

/**
 * Функция отрисовки текста с переносами
 *
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} fitWidth
 * @param {number} lineHeight
 */
CanvasRenderingContext2D.prototype.printText = function (text, x, y, fitWidth, lineHeight) {
  var self = this;
  var words = text.split(' ');
  var line = '';

  for (var n = 0; n < words.length; n++) {
    var subString = n === (words.length - 1) ? words[n] : words[n] + ' ';
    var testLine = line + subString;
    var testWidth = self.measureText(testLine).width;
    if (testWidth > fitWidth) {
      this.fillText(line, x, y);
      line = subString;
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  this.fillText(line, x, y);
};

/**
 * Функция получения максимального элемента
 * в одномерном массиве
 *
 * @param {number[]} arr
 * @return {*}
 */
var getMaxElement = function (arr) {
  return arr.sort(function (a, b) {
    return b - a;
  })[0];
};

/**
 * Генерация случайного числа
 *
 * @param {number} min
 * @param {number} max
 * @param {boolean} include Включать или нет правую границу
 * @return {number}
 */
var getRandomNumber = function (min, max, include) {
  var withInclude = Math.floor(Math.random() * (max - min + 1) + min);
  var withoutInclude = Math.floor(Math.random() * (max - min) + min);
  return include ? withInclude : withoutInclude;
};

/**
 * Функция отрисовки облака
 *
 * @param {Object} ctx
 * @param {number} startX
 * @param {number} startY
 * @param {string} fill
 * @param {string} stroke
 */
var drawCloud = function (ctx, startX, startY, fill, stroke) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.beginPath();
  ctx.moveTo(startX, startY + 50);
  ctx.bezierCurveTo(startX, startY, startX + 50, startY, startX + 50, startY);
  ctx.lineTo(startX + 370, startY);
  ctx.bezierCurveTo(startX + 370, startY, startX + 420, startY, startX + 420, startY + 50);
  ctx.lineTo(startX + 420, startY + 220);
  ctx.bezierCurveTo(startX + 420, startY + 270, startX + 370, startY + 270, startX + 370, startY + 270);
  ctx.lineTo(startX + 50, startY + 270);
  ctx.bezierCurveTo(startX + 50, startY + 270, startX, startY + 270, startX, startY + 220);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

/**
 * Функция отрисовки статистики
 * и остальных элементов
 *
 * @param {Object} ctx
 * @param {string[]} names
 * @param {number[]} times
 */
window.renderStatistics = function (ctx, names, times) {
  drawCloud(ctx, Shadow.X, Shadow.Y, Shadow.FILL_COLOR, '');
  drawCloud(ctx, Cloud.X, Cloud.Y, Cloud.FILL_COLOR, Cloud.STROKE_COLOR);
  ctx.fillStyle = Text.FILL_COLOR;
  ctx.font = Text.STYLE;
  ctx.textBaseline = Text.BASELINE;
  ctx.textAlign = Text.ALIGN;
  var message = Text.DATA;
  ctx.printText(message, Cloud.X + Cloud.WIDTH / 2, Cloud.Y + 10, MAX_WIDTH, Text.LINE_HEIGHT);

  // Получаем максимальное время прохождения
  var MAX_TIME = getMaxElement(times);

  for (var i = 0; i < names.length; i++) {
    var saturationNumber = getRandomNumber(0, 100, true);
    var barColor = 'hsl(240, ' + saturationNumber + '%, 50%)';
    if (names[i] === 'Вы') {
      barColor = Bar.PLAYER_FILL_COLOR;
    }
    var currentTime = times[i];
    var currentProportion = currentTime / MAX_TIME;
    var currentHeight = Bar.HEIGHT * currentProportion;
    var currentOffsetX = Cloud.X + Bar.GAP * (i + 1) + Bar.WIDTH * i;
    var currentOffsetY = Cloud.Y + Text.LINE_HEIGHT * 3 + (Bar.HEIGHT - currentHeight);
    ctx.textAlign = 'left';
    ctx.fillStyle = Text.FILL_COLOR;
    ctx.fillText(String(Math.floor(currentTime)), currentOffsetX, currentOffsetY);
    ctx.fillStyle = barColor;
    ctx.fillRect(currentOffsetX, currentOffsetY + Text.LINE_HEIGHT, Bar.WIDTH, currentHeight);
    ctx.fillStyle = Text.FILL_COLOR;
    ctx.fillText(names[i], currentOffsetX, Cloud.HEIGHT - Text.LINE_HEIGHT);
  }
};

