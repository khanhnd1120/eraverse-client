/** @format */

import { With } from "miniplex";
import assets from "share/assets";
import { world } from "share/G";
import {
  AnimationClipItem,
  AnimatorItem,
  PlayerState,
} from "share/game-interface";
import removePlayerState from "share/remove-player-state";
import { Entity } from "share/world";
import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  LoopRepeat,
} from "three";
import { Easing, Tween } from "three/examples/jsm/libs/tween.module.js";
import TWEEN from "@tweenjs/tween.js";
const TRANSITION = 0.3;
let animatorEntities = world.with("animator", "model", "gameObject", "player");
type AnimatorEntity = With<
  Entity,
  "animator" | "model" | "gameObject" | "player"
>;
animatorEntities.onEntityAdded.subscribe(onEntityAdded);
animatorEntities.onEntityRemoved.subscribe(onEntityRemoved);
export function animatorSystem(delta: number) {
  for (const entity of animatorEntities) {
    updateAnimator(entity, delta);
  }
}
function updateAnimator(e: AnimatorEntity, delta: number) {
  if (!e.animator.mixer) {
    return;
  }
  if (!e.animator.ready$ || !e.model.modelReady$) {
    return;
  }
  e.animator.mixer.update(delta);
  e.animator.items.forEach((animatorItem: AnimatorItem, index: number) => {
    if (animatorItem.hold > 0) {
      animatorItem.hold -= delta;
      return;
    }
    if (animatorItem.duration > 0 || animatorItem.arrAnimation.length) {
      if (animatorItem.currentClip) {
        animatorItem.duration =
          animatorItem.currentClip.getClip().duration -
          animatorItem.currentClip.time;
      }
      if (
        animatorItem.currentAnimation == "fall_idle" &&
        [e.player.stateTop, e.player.stateBottom][index] === PlayerState.Falling
      ) {
        if (!e.player.isOnFloor) {
          return;
        }
        animatorItem.duration = 0;
      }
      if (animatorItem.duration < 0.3) {
        if (animatorItem.arrAnimation.length > 0) {
          // array action not finish
          const nextAnim = animatorItem.arrAnimation.shift();
          let playClip = animatorItem.clips.find(
            (clipItem: AnimationClipItem) => clipItem.name === nextAnim
          );
          if (playClip) {
            let fadeoutClip = animatorItem.clips.find(
              (clipItem: AnimationClipItem) =>
                clipItem.name === animatorItem.currentAnimation
            );

            let transitionFadeIn = TRANSITION;
            let transitionFadeOut = TRANSITION;
            if (["fall_to_landing", "stand"].includes(nextAnim)) {
              transitionFadeIn = 0;
              transitionFadeOut = 0;
            }
            if (fadeoutClip) {
              fadeoutClip.clip.fadeOut(transitionFadeOut);
            }
            animatorItem.duration = playClip.clip.getClip().duration;
            animatorItem.currentClip = playClip.clip;
            playClip.clip.reset().play();
            if (nextAnim == "stand") {
              e.model.object.position.set(0, 0, 0.35);
            }
            if (nextAnim == "die") {
              e.model.object.traverse((child: any) => {
                if (child.isMesh && child.material) {
                  if (!child.userData.tweenOpacity) {
                    child.material.transparent = true;
                    child.material.needsUpdate = true;
                    child.userData.oldMaterial = child.material;
                    child.material = child.material.clone();
                    child.userData.tweenOpacity = new TWEEN.Tween(
                      child.material
                    )
                      .to(
                        { opacity: 0 },
                        playClip.clip.getClip().duration * 1000
                      )
                      .easing(Easing.Quadratic.Out)
                      .onComplete(() => {
                        new TWEEN.Tween(child.material)
                          .to({ opacity: 1 }, 1000)
                          .easing(Easing.Quadratic.Out)
                          .start()
                          .onComplete(() => {
                            child.material = child.userData.oldMaterial;
                            child.userData.tweenOpacity = null;
                          });
                      })
                      .start();
                  }
                }
              });
            }
            if (
              nextAnim == "walking_backward" &&
              animatorItem.currentAnimation == "stand"
            ) {
              new TWEEN.Tween(e.model.object.position)
                .to(
                  { x: 0, y: 0, z: 0 },
                  playClip.clip.getClip().duration * 1000
                )
                .easing(Easing.Quadratic.Out)
                .start();
            }
            animatorItem.currentAnimation = nextAnim;
          }
        } else {
          let state = [e.player.stateTop, e.player.stateBottom][index];
          e.player = removePlayerState(
            state,
            e.player,
            [true, false][index],
            [false, true][index]
          );
          animatorItem.duration = 0;
          animatorItem.currentClip = null;
        }
      }
    }
    if (animatorItem.nextAnimation === animatorItem.currentAnimation) {
      return;
    }
    if (animatorItem.arrAnimation.length || animatorItem.duration > 0.3) {
      return;
    }
    let transitionFadeIn = TRANSITION;
    let transitionFadeOut = TRANSITION;
    if (animatorItem.currentAnimation) {
      let fadeoutClip = animatorItem.clips.find(
        (clipItem: AnimationClipItem) =>
          clipItem.name === animatorItem.currentAnimation
      );
      if (fadeoutClip) {
        fadeoutClip.clip.fadeOut(transitionFadeOut);
      }
    }
    let isRedirect = false;
    if (animatorItem.nextAnimation) {
      let playClip = animatorItem.clips.find(
        (clipItem: AnimationClipItem) =>
          clipItem.name === animatorItem.nextAnimation
      );
      if (
        ["walking_horizontal", "walking_left", "walking_right"].includes(
          animatorItem.nextAnimation
        ) &&
        animatorItem.currentAnimation != "walking_forward"
      ) {
        isRedirect = true;
        animatorItem.hold = 0.5;
        playClip = animatorItem.clips.find(
          (clipItem: AnimationClipItem) => clipItem.name === "walking_forward"
        );
      }
      if (playClip) {
        playClip.clip.reset().fadeIn(transitionFadeIn).play();
      }
    }
    animatorItem.currentAnimation = animatorItem.nextAnimation;
    if (isRedirect) {
      animatorItem.currentAnimation = "walking_forward";
    }
  });
}
async function onEntityAdded(e: AnimatorEntity) {
  e.model.modelReady$.subscribe((isReady) => {
    if (isReady) {
      e.animator.mixer = new AnimationMixer(e.model.object);
      e.animator.items.forEach((animator: AnimatorItem) => {
        const model = assets.getModel(animator.model);
        animator.clips.forEach((clipItem: AnimationClipItem) => {
          const animClip = model.animations.find((anim) => {
            return anim.name === clipItem.name;
          });
          if (!animClip) {
            return new AnimationAction(e.animator.mixer, new AnimationClip());
          }
          clipItem.clip = e.animator.mixer.clipAction(animClip);
          clipItem.clip.clampWhenFinished = clipItem.clampWhenFinished || false;
          clipItem.clip.loop = clipItem.loop || LoopRepeat;
          clipItem.clip.setEffectiveTimeScale(clipItem.timeScale ?? 1);
        });
      });
      if (e.animator.ready$) {
        e.animator.ready$.next(true);
      }
    }
  });
}
async function onEntityRemoved(e: AnimatorEntity) {}
