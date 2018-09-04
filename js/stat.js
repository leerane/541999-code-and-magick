'use strict';

var Cloud = {
  WIDTH: 420,
  HEIGHT: 270,
  X: 100,
  Y: 10,
  GAP: 10,
  RADIUS: 50,
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
 * в одномерном числовом массиве
 *
 * @param {number[]} arr
 * @return {number}
 */
var getMaxElement = function (arr) {
  return Math.max.apply(null, arr);
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
 * Функция отрисовки прямоугольника
 * с закругленными краями
 *
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {Object} options
 */
CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, options) {
  var rectOptions = {
    topLeft: 0,
    topRight: 0,
    bottomRight: 0,
    bottomLeft: 0,
    fill: '',
    stroke: ''
  };

  for (var prop in rectOptions) {
    rectOptions[prop] = options[prop] || rectOptions[prop];
  }

  this.fillStyle = rectOptions.fill;
  this.strokeStyle = rectOptions.stroke;
  this.beginPath();
  this.moveTo(x, y + rectOptions.topLeft);
  this.quadraticCurveTo(x, y, x + rectOptions.topLeft, y);
  this.lineTo(x + width - rectOptions.topRight, y);
  this.quadraticCurveTo(x + width, y, x + width, y + rectOptions.topRight);
  this.lineTo(x + width, y + height - rectOptions.bottomRight);
  this.quadraticCurveTo(x + width, y + height, x + width - rectOptions.bottomRight, y + height);
  this.lineTo(x + rectOptions.bottomLeft, y + height);
  this.quadraticCurveTo(x, y + height, x, y + height - rectOptions.bottomLeft);
  this.lineTo(x, y + rectOptions.topLeft);

  if (rectOptions.fill) this.fill();
  if (rectOptions.stroke) this.stroke();
};

/**
 * Функция отрисовки колонки гистограммы
 *
 * @param {Object} ctx
 * @param {number} x
 * @param {number} time
 * @param {number} maxTime
 * @param {string} name
 * @param {string} color
 */
var getHistBar = function (ctx, x, time, maxTime, name, color) {
  var currentTime = time;
  var currentProportion = currentTime / maxTime;
  var currentHeight = Bar.HEIGHT * currentProportion;
  var currentOffsetX = x;
  var currentOffsetY = Cloud.Y + Text.LINE_HEIGHT * 3 + (Bar.HEIGHT - currentHeight);
  ctx.textAlign = 'left';
  ctx.fillStyle = Text.FILL_COLOR;
  ctx.fillText(String(Math.floor(currentTime)), currentOffsetX, currentOffsetY);
  ctx.fillStyle = color;
  ctx.fillRect(currentOffsetX, currentOffsetY + Text.LINE_HEIGHT, Bar.WIDTH, currentHeight);
  ctx.fillStyle = Text.FILL_COLOR;
  ctx.fillText(name, currentOffsetX, Cloud.HEIGHT - Text.LINE_HEIGHT);
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
  // Отрисовка тени и облака
  ctx.roundRect(Shadow.X, Shadow.Y, Cloud.WIDTH, Cloud.HEIGHT, {
    topLeft: Cloud.RADIUS,
    topRight: Cloud.RADIUS,
    bottomRight: Cloud.RADIUS,
    bottomLeft: Cloud.RADIUS,
    fill: Shadow.FILL_COLOR
  });
  ctx.roundRect(Cloud.X, Cloud.Y, Cloud.WIDTH, Cloud.HEIGHT, {
    topLeft: Cloud.RADIUS,
    topRight: Cloud.RADIUS,
    bottomRight: Cloud.RADIUS,
    bottomLeft: Cloud.RADIUS,
    fill: Cloud.FILL_COLOR,
    stroke: Cloud.STROKE_COLOR
  });

  // Отрисовка сообщения о победе
  ctx.fillStyle = Text.FILL_COLOR;
  ctx.font = Text.STYLE;
  ctx.textBaseline = Text.BASELINE;
  ctx.textAlign = Text.ALIGN;
  ctx.printText(Text.DATA, Cloud.X + Cloud.WIDTH / 2, Cloud.Y + 10, MAX_WIDTH, Text.LINE_HEIGHT);

  var MAX_TIME = getMaxElement(times);

  // Отрисовка баров со статистикой
  for (var i = 0; i < names.length; i++) {
    var barOffsetX = Cloud.X + Bar.GAP * (i + 1) + Bar.WIDTH * i;
    var saturationNumber = getRandomNumber(0, 100, true);
    var barColor = names[i] === 'Вы' ? Bar.PLAYER_FILL_COLOR : 'hsl(240, ' + saturationNumber + '%, 50%)';
    getHistBar(ctx, barOffsetX, times[i], MAX_TIME, names[i], barColor);
  }
};
