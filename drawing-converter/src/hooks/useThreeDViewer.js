// src/hooks/useThreeDViewer.js
import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

const useThreeDViewer = (containerRef) => {
    const scene = useRef(null);
    const camera = useRef(null);
    const renderer = useRef(null);
    const currentMesh = useRef(null);

    const [rotationX, setRotationX] = useState(0);
    const [rotationY, setRotationY] = useState(0);
    const targetRotationX = useRef(0);
    const targetRotationY = useRef(0);
    const isMouseDown = useRef(false);
    const mouseX = useRef(0);
    const mouseY = useRef(0);

    const animate = useCallback(() => {
        requestAnimationFrame(animate);

        // Smooth rotation
        setRotationX(prev => prev + (targetRotationX.current - prev) * 0.05);
        setRotationY(prev => prev + (targetRotationY.current - prev) * 0.05);

        if (currentMesh.current) {
            currentMesh.current.rotation.x = rotationX;
            currentMesh.current.rotation.y = rotationY;
        }

        if (renderer.current && scene.current && camera.current) {
            renderer.current.render(scene.current, camera.current);
        }
    }, [rotationX, rotationY]); // Depend on rotation states

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        // Scene setup
        scene.current = new THREE.Scene();
        scene.current.background = new THREE.Color(0xf0f0f0);

        // Camera setup
        camera.current = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.current.position.set(0, 0, 100);

        // Renderer setup
        renderer.current = new THREE.WebGLRenderer({ antialias: true });
        renderer.current.setSize(container.clientWidth, container.clientHeight);
        renderer.current.shadowMap.enabled = true;
        renderer.current.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.current.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.current.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        scene.current.add(directionalLight);

        // Grid helper
        const gridHelper = new THREE.GridHelper(200, 20, 0x888888, 0xcccccc);
        scene.current.add(gridHelper);

        animate();

        // Mouse Controls
        const handleMouseDown = (e) => {
            isMouseDown.current = true;
            mouseX.current = e.clientX;
            mouseY.current = e.clientY;
        };

        const handleMouseMove = (e) => {
            if (!isMouseDown.current) return;
            const deltaX = e.clientX - mouseX.current;
            const deltaY = e.clientY - mouseY.current;
            targetRotationY.current += deltaX * 0.01;
            targetRotationX.current += deltaY * 0.01;
            mouseX.current = e.clientX;
            mouseY.current = e.clientY;
        };

        const handleMouseUp = () => {
            isMouseDown.current = false;
        };

        const handleWheel = (e) => {
            if (camera.current) {
                camera.current.position.z += e.deltaY * 0.1;
                camera.current.position.z = Math.max(10, Math.min(300, camera.current.position.z));
            }
        };

        const handleResize = () => {
            if (camera.current && renderer.current && containerRef.current) {
                camera.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
                camera.current.updateProjectionMatrix();
                renderer.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
            }
        };

        container.addEventListener('mousedown', handleMouseDown);
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseup', handleMouseUp);
        container.addEventListener('wheel', handleWheel);
        window.addEventListener('resize', handleResize);

        return () => {
            if (renderer.current) {
                container.removeChild(renderer.current.domElement);
                renderer.current.dispose();
            }
            container.removeEventListener('mousedown', handleMouseDown);
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseup', handleMouseUp);
            container.removeEventListener('wheel', handleWheel);
            window.removeEventListener('resize', handleResize);
        };
    }, [containerRef, animate]);

    const addMeshToScene = useCallback((mesh) => {
        if (currentMesh.current) {
            scene.current.remove(currentMesh.current);
            currentMesh.current.geometry.dispose();
            currentMesh.current.material.dispose();
        }
        currentMesh.current = mesh;
        scene.current.add(currentMesh.current);
    }, []);

    return { addMeshToScene };
};

export default useThreeDViewer;