/** @format */

import { With } from "miniplex";
import assets from "share/assets";
import { world } from "share/G";
import { AnimationClipItem, AnimatorItem } from "share/game-interface";
import { Entity } from "share/world";
import {
  AnimationAction,
  AnimationClip,
  AnimationMixer,
  LoopRepeat,
} from "three";
const TRANSITION = 0.3;
let animatorEntities = world.with("animator", "model", "gameObject");
type AnimatorEntity = With<Entity, "animator" | "model" | "gameObject">;
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
  e.animator.items.forEach((animatorItem: AnimatorItem) => {
    if (animatorItem.nextAnimation === animatorItem.currentAnimation) {
      return;
    }
    if (animatorItem.currentAnimation) {
      let fadeoutClip = animatorItem.clips.find(
        (clipItem: AnimationClipItem) =>
          clipItem.name === animatorItem.currentAnimation
      );
      if (fadeoutClip) {
        fadeoutClip.clip.fadeOut(TRANSITION);
      }
    }
    if (animatorItem.nextAnimation) {
      let playClip = animatorItem.clips.find(
        (clipItem: AnimationClipItem) =>
          clipItem.name === animatorItem.nextAnimation
      );
      if (playClip) {
        playClip.clip.reset().fadeIn(TRANSITION).play();
      }
    }
    animatorItem.currentAnimation = animatorItem.nextAnimation;
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
