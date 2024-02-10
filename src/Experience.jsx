import { OrbitControls, useGLTF, ScrollControls, useScroll, Scroll, useAnimations, CameraControls } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { useFrame, useThree } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { useControls } from 'leva'
import * as THREE from 'three';

const angles = [
  { x: 4.8, y: 4.1, z: 7.0 },
  { x: 1, y: 2.5, z: 2.0 },
  { x: -2, y: 2.1, z: 0.6 },
  { x: -4, y: 2.7, z: 6.4 },

]

function Foo(props) {
  const ref = useRef()
  const data = useScroll()
  useFrame(() => {
    // data.offset = current scroll position, between 0 and 1, dampened
    // data.delta = current delta, between 0 and 1, dampened

    // Will be 0 when the scrollbar is at the starting position,
    // then increase to 1 until 1 / 3 of the scroll distance is reached
    const a = data.range(0, 1 / 3)
    // Will start increasing when 1 / 3 of the scroll distance is reached,
    // and reach 1 when it reaches 2 / 3rds.
    const b = data.range(1 / 3, 1 / 3)
    // Same as above but with a margin of 0.1 on both ends
    const c = data.range(1 / 3, 1 / 3, 0.1)
    // Will move between 0-1-0 for the selected range
    const d = data.curve(1 / 3, 1 / 3)
    // Same as above, but with a margin of 0.1 on both ends
    const e = data.curve(1 / 3, 1 / 3, 0.1)
    // Returns true if the offset is in range and false if it isn't
    const f = data.visible(2 / 3, 1 / 3)
    // The visible function can also receive a margin
    const g = data.visible(2 / 3, 1 / 3, 0.1)
  })
  return <mesh ref={ref} {...props} />
}


const Model = ({cameraControls}) => {
  const { scene, nodes, animations } = useGLTF('./models/solar_system.glb');
  let mixer = new THREE.AnimationMixer(scene);
  const scroll = useScroll()
  let planets = ['jupiter', 'saturn', 'earth', 'pluto'];
  let currentPage;
  let origin = {x: 0, y: 0, z: 0};
  let destination = { x: 0, y: 0, z: 0 };
  // let activePlanet;
  let pageTotal = 4

  useEffect(() => {
    // animations.forEach(clip => {
    //   const action = mixer.clipAction(clip);
    //   action.play()
    // })

    scene.traverse((child) => {
      if (child.isMesh && child.name == 'sun_sun1_0') {
        child.material.emissive = new THREE.Color('white');
        child.material.emissiveIntensity = 0.3
        child.material.toneMapped = false;
        child.material.needsUpdate = true;
      }
    })
  }, [])


  useFrame((state, delta) => {
    // mixer.update(delta * 0.03);

    let activePage = planets.findIndex((planet, idx) => {
      return scroll.visible((idx / (pageTotal-1))-0.05, 1/ (pageTotal - 1))
    })
    let activePlanet = planets[activePage];

    if (currentPage != activePage) {
      let id = `${activePlanet}_${activePlanet}1_0`
      scene.traverse((node) => {

        if (node.name == id) {
          origin = destination;
          destination = new THREE.Vector3(); // create once an reuse it
          node.getWorldPosition(destination);
          // destination.x - 10;
          // destination.y - 10;
          // destination.z - 10;
          // state.camera.position.lerp(target.x - 10, target.y - 10, target.z - 10);
          // state.camera.lookAt(target)

        }
      })
      // cameraControls.setLookAt(1, 2, 3, 1, 1, 0, true)
      console.log(destination)
      // cameraControls.current.enabled=true
      cameraControls.current.setLookAt(destination.x-10, destination.y-10, destination.z-10, destination.x, destination.y, destination.z, true)
      // cameraControls.current.enabled=false
      // cameraControls.current.rotateTo(destination)
    }
    // else {
    //   state.camera.position.set(20, 20, 20)
    //   state.camera.lookAt(0, 0, 0);
    // }

   

    //currentPage + (nextPage - currentPage) * (percent between current and next)

    let progress = scroll.range(activePage / (pageTotal - 1.05), 1 / (pageTotal - 1.05))

    // const x = origin.x + (destination.x - origin.x) * progress
    // const y = origin.y + (destination.y - origin.y) * progress
    // const z = origin.z + (destination.z - origin.z) * progress

    // let newX = THREE.MathUtils.damp(state.camera.position.x, x, 4, delta);
    // let newY = THREE.MathUtils.damp(state.camera.position.y, y, 4, delta);
    // let newZ = THREE.MathUtils.damp(state.camera.position.x, x, 4, delta);




    // var target = destination;
    // let offset = {x: 50, y:10, z:50};
    // // target.x = 0
    // // target.z = 0
    // let PI = Math.PI * 2;
    // var scroll_angle = PI * progress;
    // state.camera.position.x = target.x + offset.x * (Math.sin(scroll_angle));
    // state.camera.position.z = target.z +offset.z * (Math.cos(scroll_angle));
    // state.camera.position.y = target.y + offset.y;
    // state.camera.lookAt(target.x, target.y, target.z);

    // // state.camera.position.set(newX, newY, newZ);

    // // state.camera.lookAt(newX, newY, newZ)
    currentPage = activePage;

  })

  return (
    <primitive object={scene} scale={[20, 20, 20]} position={[0, 0, 0]} />
  )
}




export default function Experience() {

  const cameraControlsRef = useRef()

  const { bloomIntensity, luminanceThreshold, mipmapBlur } = useControls({
    bloomIntensity: 0.32, luminanceThreshold: 0.1, mipmapBlur: false
  })

  useThree(({ camera }) => {
    camera.position.set(70, 10, 70)
    camera.lookAt(0, 0, 0);
  })

  useEffect(() => {
    console.log(cameraControlsRef.current.mouseButtons)
    cameraControlsRef.current.mouseButtons.wheel = 0;
  },[])



  return (
    <>
      <ambientLight intensity={3} />
      <CameraControls ref={cameraControlsRef} />

      {/* <OrbitControls /> */}
      <ScrollControls pages={4} damping={0.1}>
        {/* <EffectComposer>
          <Bloom mipmapBlur={mipmapBlur}
            intensity={bloomIntensity}
            luminanceThreshold={luminanceThreshold}
          /> */}
        <Model cameraControls={cameraControlsRef}/>
        {/* </EffectComposer> */}
        {/* <Scroll>
          <Foo position={[0, 0, 0]} />
          <Foo position={[0, document.height, 0]} />
          <Foo position={[0, document.height * 1, 0]} />
        </Scroll> */}
        <Scroll html>
          <div style={{ backgroundColor:'green', height: '100vh', width: '100vw', opacity: 0.2 }}></div>
          <div style={{ backgroundColor: 'blue', height: '100vh', width: '100vw', opacity: 0.2 }}></div>
          <div style={{ backgroundColor: 'purple', height: '100vh', width: '100vw', opacity: 0.2 }}></div>
          <div style={{ backgroundColor: 'red', height: '100vh', width: '100vw', opacity: 0.2 }}></div>
          {/* <h1 style={{ top: '100vh', color: 'white', position: 'absolute' }}>second page</h1>
          <h1 style={{ top: '200vh', color: 'white', position: 'absolute' }}>third page</h1> */}
        </Scroll>
      </ScrollControls>
    </>

  )
}


// useFrame((state, delta) => {
//   const offset = 1 - scroll.offset
//   let pageTotal = angles.length
//   let page = Math.floor(((1 - offset) * 20) / 4)

//   const x = angles[page].x + ((angles[page + 1].x - angles[page].x) * scroll.range(page / pageTotal, 1/pageTotal))
//   const y = angles[page].y + ((angles[page + 1].y - angles[page].y) * scroll.range(page / pageTotal, 1/pageTotal))
//   const z = angles[page].z + ((angles[page + 1].z - angles[page].z) * scroll.range(page / pageTotal, 1/pageTotal))

//   let newX = THREE.MathUtils.damp(state.camera.position.x, x, 4, delta);
//   let newY = THREE.MathUtils.damp(state.camera.position.y, y, 4, delta);
//   let newZ = THREE.MathUtils.damp(state.camera.position.x, x, 4, delta);
//   state.camera.position.set(newX, newY, newZ);

//   state.camera.lookAt(0, 0, 0)
// })