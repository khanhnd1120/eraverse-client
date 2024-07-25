import myState from "share/my-state";
import { TextureLoader, Vector2 } from "three";

export default function loadTexture() {
  myState.texture$.subscribe((texture) => {
    if (!texture) {
      return;
    }
    const textureLoader: TextureLoader = new TextureLoader();

    Object.keys(texture).map((key) => {
      if (texture[key].texture) {
        return;
      }
      const textureData = texture[key].data;
      textureLoader.load(`${textureData.url}`, (tex: any) => {
        tex.colorSpace = "srgb";
        Object.keys(textureData).map((property) => {
          if (["repeat", "offset", "center"].includes(property)) {
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
        texture[key].texture = tex;
        myState.texture$.next(texture);
      });
    });
  });
}
