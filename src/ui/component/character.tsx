/** @format */
import { Canvas, useFrame } from "@react-three/fiber";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";
import { PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { AnimationMixer, Vector3 } from "three";
import assets from "share/assets";
import myState from "share/my-state";
import { useEffect } from "react";
import updateMaterialModel from "share/update-material-model";
import Constants from "share/game-constant";
let mixer: AnimationMixer = null;
let currentAnim = 1;
function Model({
  anim,
  code,
  secondAnim,
}: {
  anim: string;
  code: string;
  secondAnim?: string;
}) {
  useEffect(() => {
    myState.reloadMaterial$.next(
      Object.keys(myState.meshMaterial$.value[code]).map(
        (key: any) => myState.meshMaterial$.value[code][key]
      )
    );
  }, [code]);
  let model = SkeletonUtils.clone(
    assets.getModel(Constants.CharacterData[code].model).scene
  );
  model.scale.set(-0.85, 0.85, 0.85);

  myState.reloadMaterial$.subscribe((names: string[]) => {
    model.traverse((child: any) => {
      updateMaterialModel(child, code, names);
    });
  });
  let animBottom = assets.getModel(Constants.CharacterData[code].anim_top);
  let animTop = assets.getModel(Constants.CharacterData[code].anim_bottom);
  mixer = new AnimationMixer(model);
  let idleBottom = mixer.clipAction(
    animBottom.animations.find((a) => a.name == anim)
  );
  let idleTop = mixer.clipAction(
    animTop.animations.find((a) => a.name == anim)
  );
  let switchAnimInterval: any = null;
  if (secondAnim) {
    let secondIdleBottom = mixer.clipAction(
      animBottom.animations.find((a) => a.name == secondAnim)
    );
    let secondIdleTop = mixer.clipAction(
      animTop.animations.find((a) => a.name == secondAnim)
    );
    switchAnimInterval = () => {
      let currentAnimTop = idleTop;
      let currentAnimBottom = idleBottom;
      let nextAnimTop = secondIdleTop;
      let nextAnimBottom = secondIdleBottom;
      if (currentAnim == 2) {
        currentAnim = 1;
        currentAnimTop = secondIdleTop;
        currentAnimBottom = secondIdleBottom;
        nextAnimTop = idleTop;
        nextAnimBottom = idleBottom;
      } else {
        currentAnim = 2;
      }
      currentAnimTop.fadeOut(1);
      currentAnimBottom.fadeOut(1);
      nextAnimTop.reset().fadeIn(1).play();
      nextAnimBottom.reset().fadeIn(1).play();
    };
  }

  idleBottom.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).play();
  idleTop.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).play();
  model.position.set(1, 0, -2.5);
  useEffect(() => {
    if (switchAnimInterval) {
      let intervalId = setInterval(switchAnimInterval, 10000);
      return () => {
        clearInterval(intervalId);
      };
    }
  }, []);
  useFrame(() => {
    if (mixer) {
      mixer.update(1 / 60);
    }
  });
  return <primitive object={model} />;
}
export default function Character({
  anim,
  code,
  secondAnim,
}: {
  anim: string;
  code: string;
  secondAnim?: string;
}) {
  return (
    <Canvas>
      <Model anim={anim} code={code} secondAnim={secondAnim} />
      <EffectComposer enableNormalPass>
        <Bloom mipmapBlur luminanceThreshold={1} />
      </EffectComposer>
      <ambientLight intensity={2} />

      <directionalLight color="white" position={[0, 10, 10]} castShadow />
      <PerspectiveCamera
        makeDefault
        // manual
        lookAt={() => new Vector3(0, -10, 0)}
        position={new Vector3(0, 2, 3)}
      />
    </Canvas>
  );
}
