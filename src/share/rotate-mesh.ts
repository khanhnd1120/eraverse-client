import { Vector3 } from "three";

export default function rotateMesh(mesh: any, data: any) {
  if (mesh.userData.animate) {
    return;
  }
  mesh.geometry.computeBoundingBox();
  const bbox = mesh.geometry.boundingBox;
  const center = new Vector3();
  bbox.getCenter(center);
  const { pos } = data;
  if (center.y > 0) {
    mesh.geometry.center(); // Center geometry in the mesh's local space

    // Animate rotation of the specific mesh
    const animate = () => {
      requestAnimationFrame(animate);

      // Apply rotation to the pivot to rotate around the mesh's center
      mesh.rotation.y += 0.0000000005; // Rotate around the Y-axis
      mesh.position.set(pos.x, pos.y, pos.z);
    };

    animate();
  }

  const animate = () => {
    requestAnimationFrame(animate);

    // Apply rotation to the target mesh
    mesh.rotation.y += 0.01; // Rotate around the Y-axis
  };
  mesh.userData.animate = animate;
  animate();
}
