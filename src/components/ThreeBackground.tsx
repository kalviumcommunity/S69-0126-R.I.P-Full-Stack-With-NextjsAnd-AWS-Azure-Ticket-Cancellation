"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type RouteSpec = {
  curve: THREE.CatmullRomCurve3;
  bus: THREE.Mesh;
  tube: THREE.Mesh;
  speed: number;
  offset: number;
};

export default function ThreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 12);

    const routes: RouteSpec[] = [];
    const busGeometry = new THREE.BoxGeometry(0.32, 0.14, 0.08);
    const clock = new THREE.Clock();
    const pointer = new THREE.Vector2(0, 0);
    const cameraTarget = new THREE.Vector3();

    const createRoute = (points: THREE.Vector3[], color: string, speed: number) => {
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeometry = new THREE.TubeGeometry(curve, 120, 0.03, 8, false);
      const tubeMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
      });
      const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
      scene.add(tube);

      const busMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
      });
      const bus = new THREE.Mesh(busGeometry, busMaterial);
      scene.add(bus);

      routes.push({ curve, bus, tube, speed, offset: Math.random() });
    };

    createRoute(
      [
        new THREE.Vector3(-5.4, 2.6, 0),
        new THREE.Vector3(-2.6, 1.4, 0.3),
        new THREE.Vector3(0.4, 1.9, 0),
        new THREE.Vector3(4.9, 0.9, -0.2),
      ],
      "#f43f5e",
      0.07
    );

    createRoute(
      [
        new THREE.Vector3(-5.2, -0.2, 0.1),
        new THREE.Vector3(-1.9, -1.7, 0),
        new THREE.Vector3(1.4, -1.1, 0.2),
        new THREE.Vector3(5.3, -1.9, 0),
      ],
      "#38bdf8",
      0.05
    );

    createRoute(
      [
        new THREE.Vector3(-4.9, -2.8, -0.1),
        new THREE.Vector3(-2.7, -3.4, 0.2),
        new THREE.Vector3(1.4, -2.6, 0),
        new THREE.Vector3(4.4, -3.2, -0.1),
      ],
      "#10b981",
      0.04
    );

    createRoute(
      [
        new THREE.Vector3(-5.1, 0.8, -0.2),
        new THREE.Vector3(-2.6, 0.2, 0.1),
        new THREE.Vector3(0.2, 0.5, -0.1),
        new THREE.Vector3(4.6, 0.1, 0.2),
      ],
      "#e2e8f0",
      0.03
    );

    const resize = () => {
      const parent = canvas.parentElement;
      const width = parent?.clientWidth ?? window.innerWidth;
      const height = parent?.clientHeight ?? window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = width < 768 ? 14 : 12;
      camera.updateProjectionMatrix();
    };

    resize();
    window.addEventListener("resize", resize);

    const onPointerMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = (event.clientY / window.innerHeight) * 2 - 1;
      pointer.set(x, -y);
    };

    window.addEventListener("pointermove", onPointerMove);

    let frameId = 0;

    const animate = () => {
      frameId = window.requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const flow = elapsed * 0.12;

      cameraTarget.set(pointer.x * 0.6, pointer.y * 0.35, camera.position.z);
      camera.position.lerp(cameraTarget, 0.04);
      camera.lookAt(0, 0, 0);

      routes.forEach((route) => {
        const t = (flow * route.speed + route.offset) % 1;
        const point = route.curve.getPointAt(t);
        route.bus.position.set(point.x, point.y, point.z);
        const pulse = 1 + Math.sin(elapsed * 2.2 + route.offset * Math.PI * 2) * 0.06;
        route.bus.scale.set(pulse, pulse, 1);
      });

      renderer.render(scene, camera);
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      routes.forEach((route) => {
        route.bus.geometry.dispose();
        if (Array.isArray(route.bus.material)) {
          route.bus.material.forEach((material) => material.dispose());
        } else {
          route.bus.material.dispose();
        }
        route.tube.geometry.dispose();
        if (Array.isArray(route.tube.material)) {
          route.tube.material.forEach((material) => material.dispose());
        } else {
          route.tube.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
      aria-hidden="true"
    />
  );
}
