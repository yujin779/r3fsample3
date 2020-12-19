import ReactDOM from 'react-dom'
import React, { useState, useEffect } from 'react'
// A React renderer for Three-js: https://github.com/drcmda/react-three-fiber
import { Canvas } from 'react-three-fiber'
// A React x-platform animation library: https://github.com/react-spring/react-spring
import { useTransition, useSpring, a } from 'react-spring/three'
import { svgs, colors, deg, doubleSide } from './resources/helpers'

/** This component renders a shape */
function Shape({ shape, rotation, position, color, opacity, index }) {
  return (
    <a.mesh rotation={rotation} position={position.interpolate((x, y, z) => [x, y, z + -index * 50])}>
      <a.meshPhongMaterial attach="material" color={color} opacity={opacity} side={doubleSide} depthWrite={false} transparent />
      <shapeBufferGeometry attach="geometry" args={[shape]} />
    </a.mesh>
  )
}

/**
 * 2.メインコンテンツ
 */
function Scene() {
  const [page, setPage] = useState(0)
  const [shapes, setShapes] = useState([])
  // Switches scenes every 4 seconds
  useEffect(
    () =>
      // 一定時間ごとに処理をおこなう
      void setInterval(
        () =>
          /**
           * ./resources/helpersからインポートされたsvgの配列番号を順次変更
           */
          setPage((i) => (i + 1) % svgs.length),
        // 3秒ごとに実行
        3000
      ),
    //第2引数を空要素にすることにより
    //マウント・アンマウント時のみ第１引数の関数を実行
    []
  )
  // pageの値が変わるたびにsvgsのfunctionが実行される
  useEffect(() => void svgs[page].then(setShapes), [page])
  // 背景色変更のアニメーション
  const { color } = useSpring({ color: colors[page] })
  // Meshをマウント/アンマウントするアニメーション
  const transitions = useTransition(shapes, (item) => item.shape.uuid, {
    // ここから　非表示
    from: { rotation: [-0.2, 0.9, 0], position: [0, 50, -200], opacity: 0 },
    // ここで停止　表示
    enter: { rotation: [0, 0, 0], position: [0, 0, 0], opacity: 1 },
    // この位置に向かって　非表示
    leave: { rotation: [0.2, -0.9, 0], position: [0, -400, 200], opacity: 0 },
    config: { mass: 30, tension: 800, friction: 190, precision: 0.0001 },
    ...{ order: ['leave', 'enter', 'update'], trail: 15, lazy: true, unique: true, reset: true }
  })
  return (
    <>
      {/* 背景 */}
      <mesh scale={[20000, 20000, 1]} rotation={[0, deg(-20), 0]}>
        <planeGeometry attach="geometry" args={[1, 1]} />
        <a.meshPhongMaterial attach="material" color={color} depthTest={false} />
      </mesh>
      <group position={[1600, -700, page]} rotation={[0, deg(180), 0]}>
        {transitions.map(({ item, key, props }) => (
          <Shape key={key} {...item} {...props} />
        ))}
      </group>
    </>
  )
}

/**
 * 1.プログラムのスタート地点
 */
function App() {
  return (
    <div class="main">
      {/* invalidateFrameloop = ループの無効化 */}
      <Canvas invalidateFrameloop camera={{ fov: 90, position: [0, 0, 1800], rotation: [0, deg(-20), deg(180)], near: 0.1, far: 20000 }}>
        <ambientLight intensity={0.5} />
        <spotLight intensity={0.5} position={[300, 300, 4000]} />
        <Scene />
      </Canvas>
      {/* <a href="https://github.com/drcmda/react-three-fiber" class="top-left" children="Github" />
      <a href="https://twitter.com/0xca0a" class="top-right" children="Twitter" />
      <a href="https://github.com/react-spring/react-spring" class="bottom-left" children="+ react-spring" />
      <a href="https://www.instagram.com/tina.henschel/" class="bottom-right" children="Illustrations @ Tina Henschel" />
      <span class="header">REACT THREE FIBER</span> */}
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
