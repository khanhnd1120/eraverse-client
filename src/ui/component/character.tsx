/** @format */
import { Canvas, useFrame } from "@react-three/fiber";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";
import { PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { AnimationMixer, Vector3 } from "three";
import assets from "share/assets";
import myState from "share/my-state";
import { useEffect } from "react";
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
  let model = SkeletonUtils.clone(
    assets.getModel("model_female_premium").scene
  );
  model.scale.set(-0.85, 0.85, 0.85);

  myState.reloadMaterial$.subscribe(() => {
    model.traverse((child: any) => {
      if (child.isMesh) {
        const materialId = myState.meshMaterial$.value[code]?.[child.name];
        if (
          materialId &&
          assets.getMaterials()[materialId] &&
          assets.getMaterials()[materialId].mat
        ) {
          child.material = assets.getMaterials()[materialId].mat;
        }
        child.visible = true;
      }
    });
  });
  let animBottom = assets.getModel("female_anim_bottom");
  let animTop = assets.getModel("female_anim_top");
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
    switchAnimInterval = setInterval(() => {
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
    }, 30000);
  }

  idleBottom.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).play();
  idleTop.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).play();
  model.position.set(1, 0, -2.5);
  useEffect(() => {
    if (switchAnimInterval) {
      let intervalId = setInterval(switchAnimInterval, 30000);
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
