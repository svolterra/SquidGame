const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

renderer.setClearColor( 0x003166 , 1 ) // second argument is opacity
const light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( light );

// Global variables
const start_pos = 3;
const end_pos = -start_pos;
const text = document.querySelector('.text')
const TIME_LIMIT = 10
let gameStat = "loading"
let isLookingBackward = true


function createCube(size, positionX, rotY = 0, color = 0xffffff) {
  const geometry = new THREE.BoxGeometry(size.w, size.h, size.d);
  const material = new THREE.MeshBasicMaterial( { color } );
  const cube = new THREE.Mesh( geometry, material );
  cube.position.set(positionX, 0, 0)
  cube.rotation.y = rotY
  scene.add( cube );
  return cube;
}

camera.position.z = 5;

const loader = new THREE.GLTFLoader();

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class Doll {
  constructor () {
    loader.load("../model/scene.gltf", (gltf) => {
      scene.add(gltf.scene);
      gltf.scene.scale.set(.4, .4, .4);
      gltf.scene.position.set(0, -1, 0);
      this.doll = gltf.scene;
    })
  }

  lookBackward(){
    gsap.to(this.doll.rotation, {y: -3.15, duration: .45})
    setTimeout(() => isLookingBackward = true, 150)
  }

  lookForward(){
    gsap.to(this.doll.rotation, {y: 0, duration: .45})
    setTimeout(() => isLookingBackward = false, 150)
  }

  async start() {
    this.lookBackward()
    await delay(Math.random() * 1000 + 1000)
    this.lookForward()
    await delay((Math.random() * 750) + 750)
    await this.start()
  }
}


function createTrack() {
  createCube({w: start_pos * 2 + .2, h: 1.5, d: 1}, 0,0, 0Xe5e5e5).position.z = -1
  createCube({w: .2, h: 1.5, d: 1}, start_pos, -.35)
  createCube({w: .2, h: 1.5, d: 1}, end_pos, .35)
}
createTrack()

class Player {
 constructor() {
   const geometry = new THREE.SphereGeometry( .3, 32, 16 );
   const material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
   const sphere = new THREE.Mesh( geometry, material );
   scene.add( sphere );
   sphere.position.x = start_pos
   sphere.position.z = 1
   sphere.position.y = 0

   this.player = sphere
   this.playerInfo = {
     positionX: start_pos,
     velocity: 0
   }
 }

 run(){
   this.playerInfo.velocity = .03
 }

 stop(){
    gsap.to(this.playerInfo, {velocity:0, duration:.1})
 }

 check() {
   if(this.playerInfo.velocity > 0 && isLookingBackward) {
     text.innerText = "You lost!"
     gameStat= "over"
   }
   if(this.playerInfo.positionX < end_pos + .4) {
     text.innerText = "You won!"
     gameStat= "over"
   }
 }

 update(){
   this.check()
   this.playerInfo.positionX -= this.playerInfo.velocity
   this.player.position.x = this.playerInfo.positionX
 }
}

const player = new Player()
let doll = new Doll()

async function init() {
  await delay(500)
  text.innerText = "Starting in 3"
  await delay(500)
  text.innerText = "Starting in 2"
  await delay(500)
  text.innerText = "Starting in 1"
  await delay(500)
  text.innerText = "Go #teamclio!"
  startGame()
}

function startGame() {
  gameStat = "started"
  let progressBar = createCube({w: 5, h:.1, d: 1}, 0,0, 0xbfe6ff)
  progressBar.position.y = 3.35
  gsap.to(progressBar.scale, {x:0, duration: TIME_LIMIT, ease: "none"})
  doll.start()
  setTimeout(() => {
    if (gameStat != "over") {
      text.innerText = "You ran out of time!"
      gameStat = "over"
    }
  }, TIME_LIMIT * 1000);
}
init()

function animate() {
  if (gameStat == "over") return
  renderer.render( scene, camera );
  // cube.rotation.x  += 0.01;
  requestAnimationFrame( animate );
  player.update()
}
animate();

window.addEventListener('keydown', (e) => {
  if (gameStat != "started") return
  if (e.key == "ArrowUp") {
    player.run()
  }
})

window.addEventListener('keyup', (e) => {
  if (e.key == "ArrowUp") {
    player.stop()
  }
})

window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
