import {
  OrbitControls,
  useAnimations,
  useGLTF,
  useScroll,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

const Dog = () => {
  gsap.registerPlugin(useGSAP());
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

  let cameraRef;

  useThree(({ camera, scene, gl }) => {
    camera.position.z = 0.84;
    gl.toneMapping = THREE.ReinhardToneMapping;
    gl.outputColorSpace = THREE.SRGBColorSpace;
    cameraRef = useRef(camera);
  });

  const model = useGLTF("/models/dog.drc.glb");

  const { actions } = useAnimations(model.animations, model.scene);

  useEffect(() => {
    actions["Take 001"].play();
  }, [actions]);

  const [normalMap] = useTexture(["/images/dog_normals.jpg"]).map((texture) => {
    ((texture.flipY = false), (texture.colorSpace = THREE.SRGBColorSpace));
    return texture;
  });

  const [branchesDiffuse, branchesNormal] = useTexture([
    "/images/branches_diffuse.jpg",
    "/images/branches_normals.jpg",
  ]).map((texture) => {
    texture.colorspace = THREE.SRGBColorSpace;
    return texture;
  });

  const [
    mat1,
    mat2,
    mat3,
    mat4,
    mat5,
    mat6,
    mat7,
    mat8,
    mat9,
    mat10,
    mat11,
    mat12,
    mat13,
    mat14,
    mat15,
    mat16,
    mat17,
    mat18,
    mat19,
    mat20,
  ] = useTexture([
    "/matcap/mat-1.png",
    "/matcap/mat-2.png",
    "/matcap/mat-3.png",
    "/matcap/mat-4.png",
    "/matcap/mat-5.png",
    "/matcap/mat-6.png",
    "/matcap/mat-7.png",
    "/matcap/mat-8.png",
    "/matcap/mat-9.png",
    "/matcap/mat-10.png",
    "/matcap/mat-11.png",
    "/matcap/mat-12.png",
    "/matcap/mat-13.png",
    "/matcap/mat-14.png",
    "/matcap/mat-15.png",
    "/matcap/mat-16.png",
    "/matcap/mat-17.png",
    "/matcap/mat-18.png",
    "/matcap/mat-19.png",
    "/matcap/mat-20.png",
  ]).map((texture) => {
    texture.colorspace = THREE.SRGBColorSpace;
    return texture;
  });

  const material = useRef({
    uMatcap1: { value: mat2 },
    uMatcap2: { value: mat19 },
    uProgress: { value: 0.5 },
  });

  const dogMaterial = new THREE.MeshMatcapMaterial({
    normalMap: normalMap,
    matcap: mat2,
  });

  const branchMaterial = new THREE.MeshMatcapMaterial({
    normalMap: branchesNormal,
    map: branchesDiffuse,
  });

  function onBeforeCompile(shader) {
    ((shader.uniforms.uMatcapTexture1 = material.current.uMatcap1),
      (shader.uniforms.uMatcapTexture2 = material.current.uMatcap2),
      (shader.uniforms.uProgress = material.current.uProgress));

    // Store reference to shader uniforms for gsap animation

    shader.fragmentShader = shader.fragmentShader.replace(
      "void main() {",

      `
      uniform sampler2D uMatcapTexture1;
      uniform sampler2D uMatcapTexture2;
      uniform float uProgress;
      
      void main () {
      `,
    );


    shader.fragmentShader = shader.fragmentShader.replace(
      "vec4 matcapColor = texture2D( matcap, uv );",

      `
        vec4 matcapColor1 = texture2D( uMatcapTexture1, uv );
        vec4 matcapColor2 = texture2D( uMatcapTexture2, uv );
        float transitionFactor = 0.2;

        float progress = smoothstep(uProgress - transitionFactor, uProgress, (vViewPosition.x + vViewPosition.y)*0.5 + 0.5);

        vec4 matcapColor = mix(matcapColor2, matcapColor1, progress);
        `,
    );
  }

  dogMaterial.onBeforeCompile = onBeforeCompile;

  model.scene.traverse((child) => {
    if (child.name.includes("DOG")) {
      child.material = dogMaterial;
    } else {
      child.material = branchMaterial;
    }
  });

  const dogModel = useRef(model);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#section-1",
        start: "top top",
        endTrigger: "#section-3",
        end: "bottom bottom",
        scrub: true,
      },
    });

    tl.to(dogModel.current.scene.position, {
      z: "-=0.68",
      y: "+=0.1",
    })
      .to(dogModel.current.scene.rotation, {
        x: `+=${Math.PI / 18}`,
      })
      .to(dogModel.current.scene.position, {
        z: "+=0.1",
      })
      .to(
        dogModel.current.scene.position,
        {
          x: "-=0.46",
          y: "-=0.07",
          z: "+=0.36",
        },
        "third",
      )
      .to(
        dogModel.current.scene.rotation,
        {
          y: `-=${Math.PI / 1}`,
        },
        "third",
      );
  }, []);

  return (
    <>
      <primitive
        object={model.scene}
        position={[0.2, -0.54, 0.3]}
        rotation={[0, Math.PI / 5.8, 0]}
      />
      <directionalLight position={[0, 5, 5]} intensity={10} />
      {/* <OrbitControls /> */}
    </>
  );
};

export default Dog;
