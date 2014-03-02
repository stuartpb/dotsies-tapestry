var dotsies = {
  "a": [true, false, false, false, false],
  "b": [false, true, false, false, false],
  "c": [false, false, true, false, false],
  "d": [false, false, false, true, false],
  "e": [false, false, false, false, true],
  "f": [true, true, false, false, false],
  "g": [false, true, true, false, false],
  "h": [false, false, true, true, false],
  "i": [false, false, false, true, true],
  "j": [true, false, true, false, false],
  "k": [false, true, false, true, false],
  "l": [false, false, true, false, true],
  "m": [true, false, false, true, false],
  "n": [false, true, false, false, true],
  "o": [true, false, false, false, true],
  "p": [true, true, true, false, false],
  "q": [true, true, false, false, true],
  "r": [true, false, true, true, false],
  "s": [false, true, true, true, false],
  "t": [false, true, true, false, true],
  "u": [false, true, false, true, true],
  "v": [false, false, true, true, true],
  "w": [true, true, false, false, true],
  "x": [true, false, true, false, true],
  "y": [true, false, false, true, true],
  "z": [true, true, false, true, true]
};

function createSVGElement(name) {
  return document.createElementNS("http://www.w3.org/2000/svg", name);
}

function clearLeftovers(el, n) {
  while(el.childNodes.length > n) {
    el.removeChild(el.lastChild);
  }
}

function alphify(str){
  return str.replace(/[^a-zA-Z\s]/g,'')
}

function getLongestWord(str) {
  return str.split(/\s/g).reduce(
    function( m, n ) { return m.length > n.length ? m : n; }).length;
}

function tapestryify(squares, chars, str, width, opts) {
  var lines = str.match(new RegExp('(.{0,' +width+ '})(\\s|$)','g'));

  var gapw = opts.gapw || opts.gap || 0;
  var gaph = opts.gaph || opts.gap || 0;
  var rx = opts.rx || opts.r || 0;
  var ry = opts.ry || opts.r || 0;
  var sqw = opts.sqw || opts.size;
  var sqh = opts.sqh || opts.size;

  var top = 0, i=0, j=0, r=0;

  var newSqs = 0;
  var sqList = squares.children;
  function makeSq(className) {
    var sq = sqList[newSqs] || createSVGElement('rect');
    sq.setAttribute('x', j * (sqw + gapw));
    sq.setAttribute('y', r * (sqh + gaph) + top);
    sq.setAttribute('width', sqw);
    sq.setAttribute('height', sqh);
    sq.setAttribute('rx', rx);
    sq.setAttribute('ry', ry);
    sq.setAttribute('class', className);
    if (++newSqs > sqList.length) squares.appendChild(sq);
  }

  var newChars = 0;
  var charList = chars.children;
  function makeHintChar(char) {
    var t = charList[newChars] || createSVGElement('text');
    t.setAttribute('x', j * (sqw + gapw) + sqw/2);
    t.setAttribute('y', gaph + top + sqh/2);
    t.setAttribute('class', 'hint');
    t.textContent = char;
    if (++newChars > charList.length) chars.appendChild(t);
  }

  for (i=0; i < lines.length; i++) {
    var content = lines[i].match(/\S+/);
    var char, dots;
    for (j=0; j < width; j++) {
      r=0;
      var char = content && lines[i][j];
      var dots = char && dotsies[char.toLowerCase()];
      var charclass = dots ?
        (char == char.toLowerCase() ? 'lower' : 'upper') + ' letter'
        : (char ? 'space' : 'void')
      makeSq('gap ' + (content ? 'over ' + charclass : 'extra'));
      if (content) {
        for (r=1; r<6; r++) {
          makeSq((dots ? (dots[r-1] ? 'fill ' : 'empty ' ) : '')
            + charclass + ' content');
        }
        if (dots) makeHintChar(char);
      }
    }
    top += (sqh + gaph) * (content ? 6 : 1);
  }

  clearLeftovers(squares,newSqs);
  clearLeftovers(chars,newChars);

  return top;
}

var tapestrySqs = document.getElementById('tapestry-blocks');
var tapestryChars = document.getElementById('tapestry-hints');
var tapestryWrapper = document.getElementById('tapestry-wrapper');
var tapestrySvg = document.getElementById('tapestry');
var tapestyle = document.getElementById('tapestry-style');
var textSource = document.getElementById('text-source');
var stylesrc = document.getElementById('style-source');
var charwidthspin = document.getElementById('charwidth');
var svgImg = document.getElementById('svg-image');
var pngImg = document.getElementById('png-image');
var saveSvgButton = document.getElementById('save-svg');
var savePngButton = document.getElementById('save-png');
var frame = document.getElementById('image-frame');
var canvas = document.getElementById('raster-canvas');
var ctx = canvas.getContext('2d');

var opts = {};

function setUpOptUpdatePair(name, x, y) {
  var locker = document.getElementById(name + '-lock');
  var xspin = document.getElementById(name + x + '-spinner');
  var yspin = document.getElementById(name + y + '-spinner');
  yspin.disabled = locker.checked;

  locker.addEventListener('click', function toggleLock(evt){
    yspin.disabled = locker.checked;
    if (yspin.disabled) {
      if (yspin.value != xspin.value) {
        yspin.value = xspin.value;
        opts[name + y] = +yspin.value;
        paramsUpdated();
      }
    }
  });

  xspin.addEventListener('input', function changeX(evt) {
    opts[name + x] = +xspin.value;
    if (locker.checked) {
      yspin.value = xspin.value;
      opts[name + y] = +yspin.value;
    }
    paramsUpdated();
  });

  yspin.addEventListener('input', function changeY(evt) {
    opts[name + y] = +yspin.value;
    paramsUpdated();
  })

  opts[name + x] = +xspin.value;
  opts[name + y] = +yspin.value;
}

setUpOptUpdatePair('sq','w','h');
setUpOptUpdatePair('gap','w','h');
setUpOptUpdatePair('r','x','y');
stylesrc.addEventListener('input', updateTapeStyle);
updateTapeStyle();
textSource.addEventListener('input',textUpdated);
charwidthspin.addEventListener('input',paramsUpdated);

function textUpdated(evt){
  var str = alphify(textSource.value);
  var shortestWord = getLongestWord(str);
  charwidthspin.min = shortestWord;
  charwidthspin.value = Math.max(charwidthspin.value, charwidthspin.min);
  reRender();
}

function updateTapeStyle(evt) {
  tapestyle.textContent = stylesrc.value;
  reRender(0);
}


function paramsUpdated(){
  return reRender();
}

var renderLevel = 0;

function reRender(skip) {
  var skip = (skip !== undefined ? (skip || 0) : -1)
  if (skip < 0 && renderLevel >= 0) reRenderSvg();
  if (skip < 1 && renderLevel >= 1) setSvgImage();
  if (skip < 2 && renderLevel >= 2) drawImageToCanvas();
  if (skip < 3 && renderLevel >= 3) putCanvasToPng();
}

function setRenderLevel(newLevel) {
  var oldLevel = renderLevel;
  renderLevel = newLevel;
  reRender(oldLevel);
  for (var i = 0; i < frame.children.length; i++) {
    frame.children[i].hidden = (i != newLevel);
  }
}

function reRenderSvg() {
  var str = alphify(textSource.value);
  var charWidth = +charwidthspin.value;
  var width = (opts.sqw + opts.gapw) * charWidth - opts.gapw;
  var height = tapestryify(tapestrySqs, tapestryChars, str, charWidth, opts);
  tapestrySvg.setAttribute('height', height + opts.gaph * 2);
  tapestrySvg.setAttribute('width', width + opts.gapw * 2);
  tapestrySvg.setAttribute('viewBox', [-opts.gapw, -opts.gaph,
    width + opts.gapw*2, height + opts.gaph*2].join(' '));
}

function setSvgImage() {
  svgImg.src = "data:image/svg+xml," + tapestryWrapper.innerHTML;
}

function drawImageToCanvas() {
  var width = tapestrySvg.width.baseVal.value;
  var height = tapestrySvg.height.baseVal.value;
  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(svgImg, 0, 0, width, height);
}

function putCanvasToPng() {
  pngImg.src = canvas.toDataURL();
}

function saveSvgReady() {
  if (renderLevel >= 1) {
    saveSvgButton.href = svgImg.src;
  } else {
    if (renderLevel < 0) reRenderSvg();
    saveSvgButton.href = "data:image/svg+xml," + tapestryWrapper.innerHTML;
  }
}

function savePngReady() {
  if (renderLevel >= 3) {
    savePngButton.href = pngImg.src;
  } else {
    if (renderLevel < 0) reRenderSvg();
    if (renderLevel < 1) setSvgImage();
    if (renderLevel < 2) drawImageToCanvas();
    savePngButton.href = canvas.toDataURL();
  }
}

document.getElementById('show-bare-svg').addEventListener('click',
  setRenderLevel.bind(null, 0));
document.getElementById('show-svg-image').addEventListener('click',
  setRenderLevel.bind(null, 1));
// renderLevel 2 is boring so we skip an interface element for it
document.getElementById('show-png-image').addEventListener('click',
  setRenderLevel.bind(null, 3));
saveSvgButton.addEventListener('click', saveSvgReady);
savePngButton.addEventListener('click', savePngReady);
