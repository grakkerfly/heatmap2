// Copy contract
function copyContract() {
  navigator.clipboard.writeText("0xYourContractAddressHere");
  alert("Contract copied!");
}

// Mouse heatmap effect
document.addEventListener('mousemove', function(e){
  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.left = e.pageX + 'px';
  div.style.top = e.pageY + 'px';
  div.style.width = '30px';
  div.style.height = '30px';
  div.style.borderRadius = '50%';
  div.style.background = 'rgba(255,0,0,0.2)';
  div.style.pointerEvents = 'none';
  document.body.appendChild(div);
  setTimeout(()=>div.remove(),300);
});

// PFP Editor
const pfpInput = document.getElementById('pfp-input');
const pfpCanvas = document.getElementById('pfp-canvas');
const ctx = pfpCanvas.getContext('2d');
const filterSelect = document.getElementById('filter-select');
const fileButton = document.getElementById('file-button');
const fileName = document.getElementById('file-name');

let originalImage = null;

// gradientes originais
const heatmapsOriginal = [
  ['#000000', '#0000FF', '#FF0000', '#FFC000', '#FFD800', '#FFFFFF'],
  ['#0d0023', '#7800ff', '#ffeb45', '#ffffff', '#ff6000', '#ffba00'],
  ['#120033', '#ff0000', '#7eff00', '#6c00ff', '#b478ff', '#FFFFFF'],
  ['#060031', '#00008B', '#FF0000', '#FFF600', '#00FF00', '#0000FF'],
  ['#000000', '#302d17', '#00118f', '#ff00de', '#fff000', '#ffffff']
];

// funções de conversão e interpolação
function hexToRgb(hex){
  const bigint = parseInt(hex.replace('#',''),16);
  return {r:(bigint>>16)&255, g:(bigint>>8)&255, b:bigint&255};
}

function hexToRgbArr(hex){
  hex = hex.replace('#','');
  return [parseInt(hex.substr(0,2),16), parseInt(hex.substr(2,2),16), parseInt(hex.substr(4,2),16)];
}

function rgbToHex(rgb){
  return '#' + rgb.map(x=>Math.round(x).toString(16).padStart(2,'0')).join('');
}

function lerpColor(a,b,t){
  return [
    a[0]+(b[0]-a[0])*t,
    a[1]+(b[1]-a[1])*t,
    a[2]+(b[2]-a[2])*t
  ];
}

// gerar gradiente suave
function smoothGradient(colors, stepsPerSegment=20){
  let smooth = [];
  for(let i=0;i<colors.length-1;i++){
    const c1 = hexToRgbArr(colors[i]);
    const c2 = hexToRgbArr(colors[i+1]);
    for(let s=0;s<stepsPerSegment;s++){
      smooth.push(rgbToHex(lerpColor(c1,c2,s/stepsPerSegment)));
    }
  }
  smooth.push(colors[colors.length-1]);
  return smooth;
}

// aplicar suavização a todos os heatmaps
const heatmaps = heatmapsOriginal.map(g=>smoothGradient(g,20));

// Botão visual abre o input real
fileButton.addEventListener('click', () => {
  pfpInput.click();
});

// Atualiza nome do arquivo
pfpInput.addEventListener('change', () => {
  if (pfpInput.files.length > 0) {
    fileName.textContent = pfpInput.files[0].name;
    const file = pfpInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e){
      const img = new Image();
      img.onload = function(){
        originalImage = img;
        pfpCanvas.width = img.width * 1.2;
        pfpCanvas.height = img.height * 1.2;
        ctx.drawImage(img,0,0, pfpCanvas.width, pfpCanvas.height);
        applyFilter();
      }
      img.src = e.target.result;
    }
    reader.readAsDataURL(file);
  } else {
    fileName.textContent = 'No file chosen';
  }
});

filterSelect.addEventListener('change', applyFilter);

function applyFilter() {
  if(!originalImage) return;
  ctx.drawImage(originalImage,0,0, pfpCanvas.width, pfpCanvas.height);
  const imageData = ctx.getImageData(0,0,pfpCanvas.width,pfpCanvas.height);
  const data = imageData.data;
  const colors = heatmaps[filterSelect.value];
  for(let i=0;i<data.length;i+=4){
    const avg = (data[i]+data[i+1]+data[i+2])/3;
    const colorIndex = Math.floor(avg/(256/colors.length));
    const color = hexToRgb(colors[colorIndex]);
    data[i] = color.r;
    data[i+1] = color.g;
    data[i+2] = color.b;
  }
  ctx.putImageData(imageData,0,0);
}

function savePFP(){
  const link = document.createElement('a');
  link.download = 'pfp.png';
  link.href = pfpCanvas.toDataURL();
  link.click();
}
