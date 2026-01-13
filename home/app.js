let prev = document.getElementById('prev');
let next = document.getElementById('next');
let image = document.querySelector('.images');
let items = document.querySelectorAll('.images .item');
let contents = document.querySelectorAll('.content .item');

let rotate = 0;
let active = 0;
let countItem = items.length;
let rotateAdd = 360 / countItem;
const slideColors = [
    ['#E88735', '#0D0E12'],
    ['#2B8FD9', '#0D0E12'],
    ['#7AC74F', '#0D0E12'],
    ['#D94F8F', '#0D0E12'],
    ['#FFB22E', '#0D0E12'],
    ['#6B5BFF', '#0D0E12']
];

const sliderEl = document.querySelector('.slider');

function nextSlider(){
    active = active + 1 > countItem - 1 ? 0 : active + 1;
    rotate = rotate + rotateAdd; 
    show();
}
function prevSlider(){
    active = active - 1 < 0 ? countItem - 1 : active - 1;
    rotate = rotate - rotateAdd; 
    show();     
     
}
function show(){
    image.style.setProperty("--rotate", rotate + 'deg');
    image.style.setProperty("--rotate", rotate + 'deg');
    contents.forEach((content, key) => {
        if(key == active){
            content.classList.add('active');
        }else{
            content.classList.remove('active');
        }
    })
    if(sliderEl && sliderEl._bgA && sliderEl._bgB){
        const idx = active % slideColors.length;
        const left = slideColors[idx][0];
        const right = slideColors[idx][1];
        const grad = `linear-gradient(to right, ${left}, ${right})`;
        const visible = sliderEl._currentBg === 0 ? sliderEl._bgA : sliderEl._bgB;
        const hidden = sliderEl._currentBg === 0 ? sliderEl._bgB : sliderEl._bgA;
        hidden.style.background = grad;
        void hidden.offsetWidth;
        hidden.classList.add('visible');
        visible.classList.remove('visible');
        sliderEl._currentBg = 1 - sliderEl._currentBg;
        const accentEls = document.querySelectorAll('.content h1, .content .see-more, .content button');
        accentEls.forEach(el => {
            el.style.color = '';
            if(el.tagName.toLowerCase() === 'h1') el.style.color = left;
            if(el.classList.contains('see-more') || el.tagName.toLowerCase() === 'button') el.style.backgroundColor = left;
        });
    }
}
if(sliderEl){
    if(!sliderEl._bgA){
        const bgA = document.createElement('div');
        const bgB = document.createElement('div');
        bgA.className = 'slider-bg';
        bgB.className = 'slider-bg';
        sliderEl.insertBefore(bgA, sliderEl.firstChild);
        sliderEl.insertBefore(bgB, sliderEl.firstChild);
        sliderEl._bgA = bgA;
        sliderEl._bgB = bgB;
        sliderEl._currentBg = 0;
    }
    const idx0 = active % slideColors.length;
    sliderEl._bgA.style.background = `linear-gradient(to right, ${slideColors[idx0][0]}, ${slideColors[idx0][1]})`;
    sliderEl._bgA.classList.add('visible');
    sliderEl._bgB.style.background = sliderEl._bgA.style.background;
}
window.addEventListener("load", () => {
  const loader = document.getElementById("loading-screen");
  
  // Wait exactly 3 seconds (3000ms) before starting the fade
  setTimeout(() => {
    loader.style.opacity = "0";
    
    // Completely remove from display after fade animation finishes
    setTimeout(() => {
      loader.style.display = "none";
    }, 500); 
  }, 3000);
});

show();
show();
next.onclick = nextSlider;
prev.onclick = prevSlider;