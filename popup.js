const coordinatesDiv = document.getElementById('coordinates');
const fpsDiv = document.getElementById('fps');
const fileInput = document.getElementById('file-input');
const addFileBtn = document.getElementById('add-file-btn');
const permissionsBtn = document.getElementById('permissions-btn');
const currentTimeDiv = document.getElementById('current-time');
const batteryStatusDiv = document.getElementById('battery-status');
const networkStatusDiv = document.getElementById('network-status');

const detectVolumeBtn = document.createElement('button');
detectVolumeBtn.id = 'detect-volume-btn';
detectVolumeBtn.textContent = '音量検出';
document.querySelector('.taskbar').appendChild(detectVolumeBtn);

const volumeDisplay = document.createElement('div');
volumeDisplay.id = 'volume-display';
volumeDisplay.style.position = 'absolute';
volumeDisplay.style.width = '300px';
volumeDisplay.style.height = '150px';
volumeDisplay.style.backgroundColor = '#333';
volumeDisplay.style.color = 'white';
volumeDisplay.style.borderRadius = '5px';
volumeDisplay.style.padding = '10px';
volumeDisplay.style.zIndex = '1000';
volumeDisplay.style.display = 'none';
volumeDisplay.style.cursor = 'move';
document.body.appendChild(volumeDisplay);

const volumeDisplayHeader = document.createElement('div');
volumeDisplayHeader.style.display = 'flex';
volumeDisplayHeader.style.justifyContent = 'space-between';
volumeDisplayHeader.style.alignItems = 'center';
volumeDisplay.appendChild(volumeDisplayHeader);

const volumeDisplayTitle = document.createElement('h3');
volumeDisplayTitle.textContent = '音量検出';
volumeDisplayHeader.appendChild(volumeDisplayTitle);

const volumeDisplayCloseBtn = document.createElement('button');
volumeDisplayCloseBtn.textContent = '✖️';
volumeDisplayCloseBtn.style.border = 'none';
volumeDisplayCloseBtn.style.backgroundColor = 'transparent';
volumeDisplayCloseBtn.style.color = 'white';
volumeDisplayCloseBtn.style.cursor = 'pointer';
volumeDisplayHeader.appendChild(volumeDisplayCloseBtn);

const volumeDisplayContent = document.createElement('div');
volumeDisplayContent.style.display = 'flex';
volumeDisplayContent.style.flexDirection = 'column';
volumeDisplayContent.style.alignItems = 'center';
volumeDisplayContent.style.justifyContent = 'center';
volumeDisplayContent.style.height = 'calc(100% - 30px)';
volumeDisplay.appendChild(volumeDisplayContent);

const volumeText = document.createElement('div');
volumeText.id = 'volume-text';
volumeText.style.fontSize = '24px';
volumeDisplayContent.appendChild(volumeText);

let isDraggingVolumeWindow = false;
let volumeWindowOffsetX = 0, volumeWindowOffsetY = 0;

volumeDisplay.addEventListener('mousedown', (e) => {
  if (e.target !== volumeDisplayCloseBtn) {
    isDraggingVolumeWindow = true;
    volumeWindowOffsetX = e.clientX - volumeDisplay.getBoundingClientRect().left;
    volumeWindowOffsetY = e.clientY - volumeDisplay.getBoundingClientRect().top;
  }
});

document.addEventListener('mousemove', (e) => {
  if (isDraggingVolumeWindow) {
    volumeDisplay.style.left = `${e.clientX - volumeWindowOffsetX}px`;
    volumeDisplay.style.top = `${e.clientY - volumeWindowOffsetY}px`;
  }
});

document.addEventListener('mouseup', () => {
  isDraggingVolumeWindow = false;
});

volumeDisplayCloseBtn.addEventListener('click', () => {
  volumeDisplay.style.display = 'none';
});

detectVolumeBtn.addEventListener('click', () => {
  volumeDisplay.style.display = 'block';
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);
    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function getVolume() {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const volume = sum / bufferLength;
      volumeText.textContent = `現在の音量: ${volume.toFixed(2)}`;
      requestAnimationFrame(getVolume);
    }

    getVolume();
  }).catch(err => {
    alert('マイクのアクセスが拒否されました。');
  });
});

function updateTime() {
  const now = new Date();
  currentTimeDiv.textContent = now.toLocaleTimeString();
}
setInterval(updateTime, 1000);
updateTime();

navigator.getBattery().then(function(battery) {
  batteryStatusDiv.textContent = 'バッテリー: ' + Math.round(battery.level * 100) + '%';
  battery.addEventListener('levelchange', function() {
    batteryStatusDiv.textContent = 'バッテリー: ' + Math.round(battery.level * 100) + '%';
  });
});

let lastFrameTimestamp = performance.now();
let frameCount = 0;

function updateFPS() {
  const currentTimestamp = performance.now();
  const elapsedTime = currentTimestamp - lastFrameTimestamp;
  frameCount++;

  if (elapsedTime >= 1000) {
    const fps = Math.round((frameCount / elapsedTime) * 1000);
    fpsDiv.textContent = `FPS: ${fps}`;
    lastFrameTimestamp = currentTimestamp;
    frameCount = 0;
  }

  requestAnimationFrame(updateFPS);
}

updateFPS();

function updateNetworkStatus() {
  if (navigator.onLine) {
    const image = new Image();
    const startTime = new Date().getTime();
    const cacheBuster = '?nnn=' + startTime;
    image.src = 'https://www.google.com/images/phd/px.gif' + cacheBuster;

    image.onload = function() {
      const endTime = new Date().getTime();
      const duration = (endTime - startTime) / 1000;
      const bitsLoaded = 8 * 1024;
      const speedBps = (bitsLoaded / duration).toFixed(2);
      const speedKbps = (speedBps / 1024).toFixed(2);
      networkStatusDiv.innerHTML = `⚫️ オンライン (${speedKbps} kbps)`;
      networkStatusDiv.className = 'online';
    };
  } else {
    networkStatusDiv.innerHTML = '⚫️ オフライン';
    networkStatusDiv.className = 'offline';
  }
}

// 1秒ごとにネットワークステータスを更新
setInterval(updateNetworkStatus, 1000);

// YouTube動画再生ボタンの追加
const youtubeBtn = document.createElement('button');
youtubeBtn.id = 'youtube-btn';
youtubeBtn.textContent = 'YouTube動画再生';
document.querySelector('.taskbar').appendChild(youtubeBtn);

const youtubeWindow = document.createElement('div');
youtubeWindow.id = 'youtube-window';
youtubeWindow.style.position = 'absolute';
youtubeWindow.style.width = '640px';
youtubeWindow.style.height = '360px';
youtubeWindow.style.backgroundColor = '#333';
youtubeWindow.style.color = 'white';
youtubeWindow.style.borderRadius = '5px';
youtubeWindow.style.padding = '10px';
youtubeWindow.style.zIndex = '1000';
youtubeWindow.style.display = 'none';
youtubeWindow.style.cursor = 'move';
document.body.appendChild(youtubeWindow);

const youtubeWindowHeader = document.createElement('div');
youtubeWindowHeader.style.display = 'flex';
youtubeWindowHeader.style.justifyContent = 'space-between';
youtubeWindowHeader.style.alignItems = 'center';
youtubeWindow.appendChild(youtubeWindowHeader);

const youtubeWindowTitle = document.createElement('h3');
youtubeWindowTitle.textContent = 'YouTube 動画';
youtubeWindowHeader.appendChild(youtubeWindowTitle);

const youtubeWindowCloseBtn = document.createElement('button');
youtubeWindowCloseBtn.textContent = '✖️';
youtubeWindowCloseBtn.style.border = 'none';
youtubeWindowCloseBtn.style.backgroundColor = 'transparent';
youtubeWindowCloseBtn.style.color = 'white';
youtubeWindowCloseBtn.style.cursor = 'pointer';
youtubeWindowHeader.appendChild(youtubeWindowCloseBtn);

const youtubeIframe = document.createElement('iframe');
youtubeIframe.width = '100%';
youtubeIframe.height = '100%';
youtubeIframe.frameborder = '0';
youtubeIframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
youtubeIframe.allowfullscreen = true;
youtubeWindow.appendChild(youtubeIframe);

let isDraggingYoutubeWindow = false;
let youtubeWindowOffsetX = 0, youtubeWindowOffsetY = 0;

youtubeWindow.addEventListener('mousedown', (e) => {
  if (e.target !== youtubeWindowCloseBtn) {
    isDraggingYoutubeWindow = true;
    youtubeWindowOffsetX = e.clientX - youtubeWindow.getBoundingClientRect().left;
    youtubeWindowOffsetY = e.clientY - youtubeWindow.getBoundingClientRect().top;
  }
});

document.addEventListener('mousemove', (e) => {
  if (isDraggingYoutubeWindow) {
    youtubeWindow.style.left = `${e.clientX - youtubeWindowOffsetX}px`;
    youtubeWindow.style.top = `${e.clientY - youtubeWindowOffsetY}px`;
  }
});

document.addEventListener('mouseup', () => {
  isDraggingYoutubeWindow = false;
});

youtubeBtn.addEventListener('click', () => {
  const videoUrl = prompt('再生したいYouTube動画のURLを入力してください:');
  if (videoUrl) {
    youtubeWindow.style.display = 'block';
    youtubeIframe.src = `https://www.youtube.com/embed/${getYouTubeVideoId(videoUrl)}`;
  }
});

youtubeWindowCloseBtn.addEventListener('click', () => {
  youtubeWindow.style.display = 'none';
  youtubeIframe.src = '';
});

function getYouTubeVideoId(url) {
  const urlParams = new URLSearchParams(new URL(url).search);
  return urlParams.get('v');
}

// ファイル操作関連の機能
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      // ファイルの内容を処理する
      console.log(reader.result);
    };
    reader.readAsDataURL(file);
  }
});

addFileBtn.addEventListener('click', () => {
  fileInput.click();
});

permissionsBtn.addEventListener('click', () => {
  navigator.permissions.query({ name: 'camera' }).then(result => {
    if (result.state === 'granted') {
      alert('カメラへのアクセスが許可されています。');
    } else if (result.state === 'prompt') {
      alert('カメラへのアクセスを許可してください。');
    } else if (result.state === 'denied') {
      alert('カメラへのアクセスが拒否されました。');
    }
  });
});
// 既存のコードに追加

// カラオケモードボタンの作成
const karaokeBtn = document.createElement('button');
karaokeBtn.id = 'karaoke-btn';
karaokeBtn.textContent = 'カラオケモード';
document.querySelector('.taskbar').appendChild(karaokeBtn);

// カラオケモードウィンドウの作成
const karaokeWindow = document.createElement('div');
karaokeWindow.id = 'karaoke-window';
karaokeWindow.style.position = 'absolute';
karaokeWindow.style.width = '400px';
karaokeWindow.style.height = '200px';
karaokeWindow.style.backgroundColor = '#333';
karaokeWindow.style.color = 'white';
karaokeWindow.style.border = '1px solid #ccc';
karaokeWindow.style.borderRadius = '5px';
karaokeWindow.style.padding = '20px';
karaokeWindow.style.zIndex = '1000';
karaokeWindow.style.display = 'none';
karaokeWindow.style.cursor = 'move';
document.body.appendChild(karaokeWindow);

let isDraggingKaraokeWindow = false;
let karaokeWindowOffsetX = 0, karaokeWindowOffsetY = 0;

karaokeWindow.addEventListener('mousedown', (e) => {
  if (e.target !== karaokeWindowCloseBtn) {
    isDraggingKaraokeWindow = true;
    karaokeWindowOffsetX = e.clientX - karaokeWindow.getBoundingClientRect().left;
    karaokeWindowOffsetY = e.clientY - karaokeWindow.getBoundingClientRect().top;
  }
});

document.addEventListener('mousemove', (e) => {
  if (isDraggingKaraokeWindow) {
    karaokeWindow.style.left = `${e.clientX - karaokeWindowOffsetX}px`;
    karaokeWindow.style.top = `${e.clientY - karaokeWindowOffsetY}px`;
  }
});

document.addEventListener('mouseup', () => {
  isDraggingKaraokeWindow = false;
});

// カラオケモードウィンドウのコンテンツ
const karaokeWindowTitle = document.createElement('h3');
karaokeWindowTitle.textContent = 'カラオケモードです';
karaokeWindow.appendChild(karaokeWindowTitle);

const karaokeWindowMessage = document.createElement('p');
karaokeWindowMessage.textContent = '×ボタンを押すとカラオケモードを終了します';
karaokeWindow.appendChild(karaokeWindowMessage);

const karaokeWindowCloseBtn = document.createElement('button');
karaokeWindowCloseBtn.textContent = '✖️';
karaokeWindowCloseBtn.style.position = 'absolute';
karaokeWindowCloseBtn.style.top = '10px';
karaokeWindowCloseBtn.style.right = '10px';
karaokeWindowCloseBtn.style.border = 'none';
karaokeWindowCloseBtn.style.backgroundColor = 'transparent';
karaokeWindowCloseBtn.style.color = 'white';
karaokeWindowCloseBtn.style.cursor = 'pointer';
karaokeWindow.appendChild(karaokeWindowCloseBtn);

karaokeWindowCloseBtn.addEventListener('click', () => {
  karaokeWindow.style.display = 'none';
});

// カラオケモードを開始するボタン
const startKaraokeBtn = document.createElement('button');
startKaraokeBtn.id = 'start-karaoke-btn';
startKaraokeBtn.textContent = 'カラオケモードを開始';
document.querySelector('.taskbar').appendChild(startKaraokeBtn);

startKaraokeBtn.addEventListener('click', () => {
  karaokeWindow.style.display = 'block';
});

  // 音が反射するように処理を実装
  console.log('音が反射しています');
// 既存のコードに追加

// 音楽再生ボタンの作成
const musicPlayBtn = document.createElement('button');
musicPlayBtn.id = 'music-play-btn';
musicPlayBtn.textContent = '音楽再生';
document.querySelector('.taskbar').appendChild(musicPlayBtn);

// 音楽プレイヤーの作成
const musicPlayer = document.createElement('audio');
musicPlayer.id = 'music-player';
document.body.appendChild(musicPlayer);

// 音楽ファイルのソース
const musicSource = document.createElement('source');
musicSource.src = 'https://open.spotify.com/playlist/6SLmraznygTozKFu9biSJk?si=faf679b9c2c8454a'; // サンプルの音楽ファイルのパス
musicSource.type = 'audio/mpeg';
musicPlayer.appendChild(musicSource);

// 音楽再生機能の実装
let isPlaying = false;

musicPlayBtn.addEventListener('click', () => {
  if (!isPlaying) {
    musicPlayer.play();
    isPlaying = true;
    musicPlayBtn.textContent = '音楽停止';
  } else {
    musicPlayer.pause();
    isPlaying = false;
    musicPlayBtn.textContent = '音楽再生';
  }
});

const mysteryBtn = document.createElement('button');
mysteryBtn.textContent = '???';
document.querySelector('.taskbar').appendChild(mysteryBtn);

const inputWindow = document.createElement('div');
inputWindow.id = 'input-window';
inputWindow.style.position = 'absolute';
inputWindow.style.width = '400px';
inputWindow.style.height = '200px';
inputWindow.style.backgroundColor = '#fff';
inputWindow.style.border = '1px solid #ccc';
inputWindow.style.borderRadius = '5px';
inputWindow.style.padding = '20px';
inputWindow.style.zIndex = '1000';
inputWindow.style.display = 'none';
document.body.appendChild(inputWindow);

const inputField = document.createElement('input');
inputField.type = 'text';
inputField.placeholder = '入力してください';
inputWindow.appendChild(inputField);

const inputWindowSubmitBtn = document.createElement('button');
inputWindowSubmitBtn.textContent = '送信';
inputWindow.appendChild(inputWindowSubmitBtn);

mysteryBtn.addEventListener('click', () => {
  inputWindow.style.display = 'block';
});

inputWindowSubmitBtn.addEventListener('click', () => {
  const inputValue = inputField.value;
  if (inputValue === '↑↓↑↑↑↓BY') {
    displayGameWindow();
  } else {
    inputWindow.style.display = 'none';
  }
});

function displayGameWindow() {
  // ゲームウィンドウの定義と表示処理を追加する
  const gameWindow = document.createElement('div');
  gameWindow.id = 'game-window';
  gameWindow.style.position = 'absolute';
  gameWindow.style.width = '600px';
  gameWindow.style.height = '400px';
  gameWindow.style.backgroundColor = '#333';
  gameWindow.style.color = 'white';
  gameWindow.style.borderRadius = '5px';
  gameWindow.style.padding = '20px';
  gameWindow.style.zIndex = '1000';
  gameWindow.style.display = 'block';
  document.body.appendChild(gameWindow);

  // ゲームの表示処理を追加する
  // ...
}
