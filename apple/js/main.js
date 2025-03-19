import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ゲーム状態の管理
let gameState = {
    isPlaying: false,
    timeLeft: 10,
    rotationCount: 0,
    lastRotation: 0,
    rotationThreshold: 6.28, // 約360度（2π）
    totalRotation: 0
};

// シーンの作成
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

// カメラの設定
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 0.5;
camera.position.y = 0.2;

// レンダラーの設定
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

// ライトの設定
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// OrbitControlsの設定
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 0.3;
controls.maxDistance = 1.0;

// UI要素の取得
const timerElement = document.getElementById('timer');
const rotationCountElement = document.getElementById('rotationCount');
const startButton = document.getElementById('startButton');
const resultElement = document.getElementById('result');

// ゲーム開始処理
function startGame() {
    gameState.isPlaying = true;
    gameState.timeLeft = 10;
    gameState.rotationCount = 0;
    gameState.lastRotation = controls.getAzimuthalAngle();
    gameState.totalRotation = 0;
    
    startButton.disabled = true;
    resultElement.textContent = '';
    updateUI();
    
    // タイマーの開始
    const timerInterval = setInterval(() => {
        gameState.timeLeft--;
        updateUI();
        
        if (gameState.timeLeft <= 0) {
            endGame();
            clearInterval(timerInterval);
        }
    }, 1000);
}

// ゲーム終了処理
function endGame() {
    gameState.isPlaying = false;
    startButton.disabled = false;
    resultElement.textContent = `ゲーム終了！ 合計${gameState.rotationCount}回転達成！`;
}

// UI更新
function updateUI() {
    timerElement.textContent = gameState.timeLeft;
    rotationCountElement.textContent = gameState.rotationCount;
}

// 回転の検出
function checkRotation() {
    if (!gameState.isPlaying) return;
    
    const currentRotation = controls.getAzimuthalAngle();
    const rotationDiff = Math.abs(currentRotation - gameState.lastRotation);
    gameState.totalRotation += rotationDiff;
    
    if (gameState.totalRotation >= gameState.rotationThreshold) {
        gameState.rotationCount++;
        gameState.totalRotation = 0;
        updateUI();
    }
    
    gameState.lastRotation = currentRotation;
}

// モデルのロード
const loader = new GLTFLoader();
loader.load(
    '/apple/apple.gltf',
    function (gltf) {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        model.scale.set(1, 1, 1);
        scene.add(model);
        document.getElementById('loading').style.display = 'none';
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('モデルの読み込みに失敗しました:', error);
    }
);

// イベントリスナーの設定
startButton.addEventListener('click', startGame);

// ウィンドウリサイズ時の処理
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// アニメーションループ
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    checkRotation();
    renderer.render(scene, camera);
}

animate(); 