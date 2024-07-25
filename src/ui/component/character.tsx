/** @format */
import { Canvas, useFrame } from "@react-three/fiber";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";
import { PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { AnimationMixer, Vector3 } from "three";
import assets from "share/assets";
import myState from "share/my-state";
let mixer: AnimationMixer = null;
function Model({ anim, code }: { anim: string; code: string }) {
  const model = SkeletonUtils.clone(assets.getModel("model_chibi_male_premium").scene);
  model.scale.set(1.5, 1.5, 1.5);
 
  model.traverse((child: any) => {
    if (child.isMesh) {
      const materialId = myState.meshMaterial$.value[code]?.[child.name];
      if (materialId) {
        child.material = myState.material$.value[materialId].mat;
      }
      child.visible = true;
    }
  });
  let animBottom = assets.getModel("anim_chibi_male_premium_bottom");
  let animTop = assets.getModel("anim_chibi_male_premium_top");
  mixer = new AnimationMixer(model);
  let idleBottom = mixer.clipAction(
    animBottom.animations.find((a) => a.name == anim)
  );
  let idleTop = mixer.clipAction(
    animTop.animations.find((a) => a.name == anim)
  );
  idleBottom.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).play();
  idleTop.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).play();
  model.position.set(1, 0, -2.5);
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
}: {
  anim: string;
  code: string;
}) {
  return (
    <Canvas>
      <Model anim={anim} code={code} />
      <EffectComposer enableNormalPass>
        <Bloom mipmapBlur luminanceThreshold={1} />
      </EffectComposer>
      <ambientLight intensity={2} />

      <directionalLight color="white" position={[0, 10, 10]}  castShadow />
      <PerspectiveCamera
        makeDefault
        // manual
        lookAt={() => new Vector3(0, -10, 0)}
        position={new Vector3(0, 2, 3)}
      />
    </Canvas>
  );
}
