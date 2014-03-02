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

function clearElement(el) {
  var fc = el.firstChild;
  while (fc) {
    el.removeChild(fc);
    fc = el.firstChild;
  }
}

function alphify(str){
  return str.replace(/[^a-zA-Z\s]/,'')
}

function getLongestWord(str) {
  return str.split(/\s/g).reduce(
    function( m, n ) { return m.length > n.length ? m : n; }).length;
}

function tapestryify(group, str, width, opts) {
  var lines = str.match(new RegExp('(.{0,' +width+ '})(\\s|$)','g'));

  var gapw = opts.gapw || opts.gap || 0;
  var gaph = opts.gaph || opts.gap || 0;
  var rx = opts.rx || opts.r || 0;
  var ry = opts.ry || opts.r || 0;
  var sqw = opts.sqw || opts.size;
  var sqh = opts.sqh || opts.size;

  clearElement(group);

  var top = 0, i=0, j=0, r=0;

  function makeSq(className) {
    var sq = createSVGElement('rect');
    sq.setAttribute('x', j * (sqw + gapw));
    sq.setAttribute('y', r * (sqh + gaph) + top);
    sq.setAttribute('width', sqw);
    sq.setAttribute('height', sqh);
    sq.setAttribute('rx', rx);
    sq.setAttribute('ry', ry);
    sq.setAttribute('class', className);
    return sq;
  }

  function makeHintChar(char) {
    var t = createSVGElement('text');
    t.setAttribute('x', j * (sqw + gapw) + sqw/2);
    t.setAttribute('y', gaph + top + sqh/2);
    t.setAttribute('class', 'hint');
    t.textContent = char;
    return t;
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
      group.appendChild(makeSq('gap ' +
        (content ? 'over ' + charclass : 'extra')));
      if (content) {
        for (r=1; r<6; r++) {
          group.appendChild(makeSq(
            (dots ? (dots[r-1] ? 'fill ' : 'empty ' ) : '')
              + charclass + ' content'));
        }
        if (dots) group.appendChild(makeHintChar(char));
      }
    }
    top += (sqh + gaph) * (content ? 6 : 1);
  }

  return top;
}

var tapestry = document.getElementById('tapestry-blocks');
var tapestrySvg = document.getElementById('tapestry');
var tapestyle = document.getElementById('tapestry-style');
var stylesrc = document.getElementById('style-source');

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

var textSource = document.getElementById('text-source');

var charwidthspin = document.getElementById('charwidth');

function textUpdated(evt){
  var str = alphify(textSource.value);
  var shortestWord = getLongestWord(str);
  charwidthspin.min = shortestWord;
  charwidthspin.value = Math.max(charwidthspin.value, charwidthspin.min);
  reRenderSvg();
}

function paramsUpdated(){
  return reRenderSvg();
}

function reRenderSvg() {
  var str = alphify(textSource.value);
  var charWidth = +charwidthspin.value;
  var width = (opts.sqw + opts.gapw) * charWidth - opts.gapw;
  var height = tapestryify(tapestry, str, charWidth, opts);
  tapestrySvg.setAttribute('height', height + opts.gaph * 2);
  tapestrySvg.setAttribute('width', width + opts.gapw * 2);
  tapestrySvg.setAttribute('viewBox', [-opts.gapw, -opts.gaph,
    width + opts.gapw*2, height + opts.gaph*2].join(' '));
}

textSource.addEventListener('input',textUpdated);
charwidthspin.addEventListener('input',paramsUpdated);

function updateTapeStyle(evt) {
  tapestyle.textContent = stylesrc.value;
}

stylesrc.addEventListener('input', updateTapeStyle);
updateTapeStyle();
