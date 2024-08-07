import myState from "share/my-state";
import { CanvasTexture, ImageBitmapLoader, Vector2 } from "three";
import assets from "./assets";

export default function loadTexture() {
  myState.texture$.subscribe((texture) => {
    if (!texture) {
      return;
    }
    if (myState.loadingTexture$.value) {
      return;
    }
    myState.loadingTexture$.next(true);
    const bitmapLoader = new ImageBitmapLoader();
    Object.keys(texture).map((key) => {
      if (texture[key].texture || texture[key].loading) {
        return;
      }
      const textureData = texture[key].data;
      let image = assets.getImage(key);
      if (!image) {
        texture[key].loading = true;
        let url = textureData.url;
        bitmapLoader.load(url, (res) => {
          assets.setImage(key, {
            url: textureData.url,
            img: res,
          });
          const tex = new CanvasTexture(res);
          tex.colorSpace = "srgb";
          Object.keys(textureData).map((property) => {
            if (["repeat", "offset", "center"].includes(property)) {
              // @ts-ignore
              tex[property] = new Vector2(
                textureData[property][0],
                textureData[property][1]
              );
            } else {
              if (!["image"].includes(property)) {
                // @ts-ignore
                tex[property] = textureData[property];
              }
            }
          });
          // @ts-ignore
          delete tex.url;
          tex.wrapS = 1000;
          tex.wrapT = 1000;
          texture[key].texture = tex;
          myState.texture$.next(texture);
        });
      }
    });
    myState.loadingTexture$.next(false);
  });
}