document.addEventListener('DOMContentLoaded', function(){
  const blocks = document.querySelectorAll('.activité-block');
  blocks.forEach(block => {
    const text = block.querySelector('.activité-texte');
    const imgDiv = block.querySelector('.activité-image');
    if(!text || !imgDiv) return;
    text.style.cursor = 'pointer';
    text.addEventListener('click', function(e){
      // store original background once
      if(!imgDiv.dataset.bgOriginal) {
        imgDiv.dataset.bgOriginal = getComputedStyle(imgDiv).backgroundImage || '';
      }
      // if a puzzle already exists, remove it and restore background so we can replay
      const existing = imgDiv.querySelector('.puzzle');
      if(existing) {
        existing.remove();
        imgDiv.style.backgroundImage = imgDiv.dataset.bgOriginal || 'none';
      }
      createPuzzle(imgDiv, 3, 3);
    });
  });

  function extractUrl(bg){
    if(!bg) return null;
    const m = /url\((?:"|')?(.*?)(?:"|')?\)/.exec(bg);
    return m && m[1] ? m[1] : null;
  }

  function createPuzzle(container, rows, cols){
    const style = getComputedStyle(container);
    const bg = extractUrl(style.backgroundImage);
    if(!bg) return;

    // Use clientWidth/clientHeight to match the element's background painting area (includes padding)
    const w = Math.max(1, Math.round(container.clientWidth));
    const h = Math.max(1, Math.round(container.clientHeight));

    // ensure container is positioned
    if(getComputedStyle(container).position === 'static') container.style.position = 'relative';

    const puzzle = document.createElement('div');
    puzzle.className = 'puzzle';
    puzzle.style.position = 'absolute';
    puzzle.style.left = '0';
    puzzle.style.top = '0';
    puzzle.style.width = '100%';
    puzzle.style.height = '100%';
    puzzle.style.pointerEvents = 'none';
    container.appendChild(puzzle);

    // hide original background to avoid double image
    container.style.backgroundImage = 'none';

    // compute piece sizes; use floor so we can adjust the last piece to fill remaining pixels
    const pieceW = Math.floor(w / cols);
    const pieceH = Math.floor(h / rows);
    const total = rows * cols;
    let index = 0;

    for(let r=0; r<rows; r++){
      for(let c=0; c<cols; c++){
        const piece = document.createElement('div');
        piece.className = 'piece';
        piece.style.position = 'absolute';
        piece.style.overflow = 'hidden';
        // compute position and size; ensure last column/row fill remaining pixels
        const left = c * pieceW;
        const top = r * pieceH;
        const thisW = (c === cols - 1) ? (w - pieceW * (cols - 1)) : pieceW;
        const thisH = (r === rows - 1) ? (h - pieceH * (rows - 1)) : pieceH;
        piece.style.left = left + 'px';
        piece.style.top = top + 'px';
        piece.style.width = thisW + 'px';
        piece.style.height = thisH + 'px';

        // Use CSS background on the piece so the full image is visible and precisely positioned
        piece.style.backgroundImage = `url(${bg})`;
        piece.style.backgroundPosition = `-${left}px -${top}px`;
        piece.style.backgroundSize = `${w}px ${h}px`;
        piece.style.backgroundRepeat = 'no-repeat';
        puzzle.appendChild(piece);

        // initial scattered state
        const randX = (Math.random() - 0.5) * (w * 1.2);
        const randY = (Math.random() - 0.5) * (h * 1.2);
        const randR = (Math.random() - 0.5) * 60; // degrees
        piece.style.transform = `translate(${randX}px, ${randY}px) rotate(${randR}deg) scale(0.9)`;
        piece.style.opacity = '0';
        piece.style.transition = `transform 700ms cubic-bezier(.2,.8,.2,1) ${index*70}ms, opacity 300ms ease ${index*40}ms`;

        // force reflow then animate to place
        (function(p){
          requestAnimationFrame(()=>{
            p.style.transform = 'translate(0px, 0px) rotate(0deg) scale(1)';
            p.style.opacity = '1';
          });
        })(piece);

        index++;
      }
    }

    // optional: after animation, allow clicking text again to remove puzzle
    setTimeout(()=>{
      // allow pointer events on puzzle to keep it interactive? keep none
      // add a subtle pulse once assembled
      puzzle.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.01)' },
        { transform: 'scale(1)' }
      ], { duration: 900, iterations: 1, easing: 'ease-out' });
    }, 700 + total*70);
  }
});
