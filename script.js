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

  var gapx = opts.xgap || opts.gap || 0;
  var gapy = opts.ygap || opts.gap || 0;
  var rx = opts.rx || opts.r || 0;
  var ry = opts.ry || opts.r || 0;
  var sqw = opts.sqw || opts.size;
  var sqh = opts.sqh || opts.size;

  clearElement(group);

  var top = 0, i=0, j=0, r=0;

  function makeSq(className) {
    var sq = createSVGElement('rect');
    sq.setAttribute('x', j * (sqw + gapx));
    sq.setAttribute('y', r * (sqh + gapy) + top);
    sq.setAttribute('width', sqw);
    sq.setAttribute('height', sqh);
    sq.setAttribute('rx', rx);
    sq.setAttribute('ry', ry);
    sq.setAttribute('class', className);
    return sq;
  }

  for (i=0; i < lines.length; i++) {
    var content = lines[i].match(/\S+/);
    for (j=0; j < width; j++) {
      r=0;
      group.appendChild(makeSq('interline'));
      if (content) {
        var char = lines[i][j];
        var dots = char && dotsies[char.toLowerCase()];
        for (r=1; r<6; r++) {
          group.appendChild(makeSq(
            dots ? (dots[r-1] ? 'dit' : 'wash' ) +
              (char == char.toLowerCase() ? ' lower' : ' upper')
            : 'space'));
        }
      }
    }
    top += (sqh + gapy) * (content ? 6 : 1);
  }

  return top;
}

var tapestry = document.getElementById('tapestry-blocks');
var tapestrySvg = document.getElementById('tapestry');
var tapestyle = document.getElementById('tapestry-style');
var stylesrc = document.getElementById('style-source');

document.getElementById('text-source').addEventListener('input',
function(evt){
  var str = alphify(evt.target.value);
  var charWidth = getLongestWord(str)
  var width = (25+5)*charWidth-5;
  var height = tapestryify(tapestry, str, charWidth, {size: 25, gap: 5})-5;
  tapestrySvg.setAttribute('height',height);
  tapestrySvg.setAttribute('width',width);
});

function updateTapeStyle(evt) {
  tapestyle.textContent = stylesrc.value;
}

stylesrc.addEventListener('input', updateTapeStyle);
updateTapeStyle();
