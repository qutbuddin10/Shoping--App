import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function InitialLoader({ duration = 3000 }) {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    const [progress, setProgress] = useState(0);
    const [exiting, setExiting] = useState(false);
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        const startTime = performance.now();

        let animationFrame;
        let exitTimer;

        const updateProgress = (currentTime) => {
            const elapsed = currentTime - startTime;

            const percentage = Math.min(
                (elapsed / duration) * 100,
                100
            );

            setProgress(Math.round(percentage));

            if (percentage >= 100) {
                setExiting(true);

                exitTimer = setTimeout(() => {
                    setFinished(true);
                }, 700);

                return;
            }

            animationFrame = requestAnimationFrame(
                updateProgress
            );
        };

        animationFrame = requestAnimationFrame(
            updateProgress
        );

        return () => {
            cancelAnimationFrame(animationFrame);

            if (exitTimer) {
                clearTimeout(exitTimer);
            }
        };
    }, [duration]);

    useEffect(() => {
        if (finished) {
            return undefined;
        }

        const canvas = canvasRef.current;
        const container = containerRef.current;

        if (!canvas || !container) {
            return undefined;
        }

        let renderer;
        let scene;
        let camera;
        let animationFrame;

        let core;
        let outerRing;
        let ringOne;
        let ringTwo;
        let particles;

        let disposed = false;

        /* ============================================================
           SCENE
        ============================================================ */

        scene = new THREE.Scene();

        const getSize = () => {
            const rect =
                container.getBoundingClientRect();

            return {
                width: Math.max(rect.width, 1),
                height: Math.max(rect.height, 1),
            };
        };

        const initialSize = getSize();

        /* ============================================================
           CAMERA
        ============================================================ */

        camera = new THREE.PerspectiveCamera(
            40,
            initialSize.width / initialSize.height,
            0.1,
            100
        );

        camera.position.set(
            0,
            0,
            6
        );

        /* ============================================================
           RENDERER
        ============================================================ */

        renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
        });

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                2
            )
        );

        renderer.setSize(
            initialSize.width,
            initialSize.height,
            false
        );

        renderer.setClearColor(
            0x000000,
            0
        );

        /* ============================================================
           LIGHTING
        ============================================================ */

        const ambientLight =
            new THREE.AmbientLight(
                0xffffff,
                0.8
            );

        scene.add(ambientLight);

        const cyanLight =
            new THREE.PointLight(
                0x22d3ee,
                8,
                20
            );

        cyanLight.position.set(
            2.5,
            2,
            4
        );

        scene.add(cyanLight);

        const violetLight =
            new THREE.PointLight(
                0x8b5cf6,
                7,
                20
            );

        violetLight.position.set(
            -2.5,
            -2,
            3
        );

        scene.add(violetLight);

        /* ============================================================
           MAIN CORE
        ============================================================ */

        core = new THREE.Group();

        scene.add(core);

        /* Main Sphere */

        const sphereGeometry =
            new THREE.IcosahedronGeometry(
                0.72,
                4
            );

        const sphereMaterial =
            new THREE.MeshPhysicalMaterial({
                color: 0x111827,
                metalness: 0.35,
                roughness: 0.12,
                transmission: 0.65,
                transparent: true,
                opacity: 0.92,
                clearcoat: 1,
                clearcoatRoughness: 0.05,
                emissive: 0x312e81,
                emissiveIntensity: 0.45,
            });

        const sphere =
            new THREE.Mesh(
                sphereGeometry,
                sphereMaterial
            );

        core.add(sphere);

        /* ============================================================
           OUTER WIREFRAME
        ============================================================ */

        const outerGeometry =
            new THREE.IcosahedronGeometry(
                1.05,
                2
            );

        const outerMaterial =
            new THREE.MeshBasicMaterial({
                color: 0x67e8f9,
                transparent: true,
                opacity: 0.16,
                wireframe: true,
            });

        outerRing =
            new THREE.Mesh(
                outerGeometry,
                outerMaterial
            );

        core.add(outerRing);

        /* ============================================================
           ORBIT RINGS
        ============================================================ */

        const ringGeometryOne =
            new THREE.TorusGeometry(
                1.35,
                0.018,
                12,
                100
            );

        const ringMaterialOne =
            new THREE.MeshBasicMaterial({
                color: 0x22d3ee,
                transparent: true,
                opacity: 0.7,
            });

        ringOne =
            new THREE.Mesh(
                ringGeometryOne,
                ringMaterialOne
            );

        ringOne.rotation.x =
            Math.PI / 2.4;

        ringOne.rotation.z =
            Math.PI / 5;

        scene.add(ringOne);

        const ringGeometryTwo =
            new THREE.TorusGeometry(
                1.65,
                0.012,
                12,
                100
            );

        const ringMaterialTwo =
            new THREE.MeshBasicMaterial({
                color: 0xa78bfa,
                transparent: true,
                opacity: 0.5,
            });

        ringTwo =
            new THREE.Mesh(
                ringGeometryTwo,
                ringMaterialTwo
            );

        ringTwo.rotation.x =
            Math.PI / 3;

        ringTwo.rotation.z =
            -Math.PI / 4;

        scene.add(ringTwo);

        /* ============================================================
           PARTICLES
        ============================================================ */

        const isMobile =
            window.innerWidth < 640;

        const particleCount =
            isMobile ? 45 : 90;

        const particlePositions =
            new Float32Array(
                particleCount * 3
            );

        for (
            let i = 0;
            i < particleCount;
            i++
        ) {
            const radius =
                1.3 +
                Math.random() * 1.8;

            const angle =
                Math.random() *
                Math.PI *
                2;

            const vertical =
                (Math.random() - 0.5) *
                3;

            particlePositions[i * 3] =
                Math.cos(angle) *
                radius;

            particlePositions[i * 3 + 1] =
                vertical;

            particlePositions[i * 3 + 2] =
                Math.sin(angle) *
                radius;
        }

        const particleGeometry =
            new THREE.BufferGeometry();

        particleGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
                particlePositions,
                3
            )
        );

        const particleMaterial =
            new THREE.PointsMaterial({
                color: 0x67e8f9,
                size: isMobile
                    ? 0.035
                    : 0.045,
                transparent: true,
                opacity: 0.75,
                sizeAttenuation: true,
            });

        particles =
            new THREE.Points(
                particleGeometry,
                particleMaterial
            );

        scene.add(particles);

        /* ============================================================
           RESIZE
        ============================================================ */

        const handleResize = () => {
            if (!renderer || !camera) {
                return;
            }

            const {
                width,
                height,
            } = getSize();

            camera.aspect =
                width / height;

            camera.updateProjectionMatrix();

            renderer.setPixelRatio(
                Math.min(
                    window.devicePixelRatio || 1,
                    width < 640 ? 1.5 : 2
                )
            );

            renderer.setSize(
                width,
                height,
                false
            );
        };

        window.addEventListener(
            "resize",
            handleResize
        );

        window.addEventListener(
            "orientationchange",
            handleResize
        );

        /* ============================================================
           ANIMATION
        ============================================================ */

        const clock =
            new THREE.Clock();

        const animate = () => {
            if (disposed) {
                return;
            }

            const time =
                clock.getElapsedTime();

            core.rotation.y =
                time * 0.35;

            core.rotation.x =
                Math.sin(time * 0.7) *
                0.08;

            sphere.rotation.y =
                time * 0.5;

            sphere.rotation.x =
                time * 0.25;

            outerRing.rotation.y =
                -time * 0.3;

            outerRing.rotation.z =
                time * 0.2;

            ringOne.rotation.y =
                time * 0.55;

            ringOne.rotation.z =
                Math.PI / 5 +
                time * 0.15;

            ringTwo.rotation.y =
                -time * 0.4;

            ringTwo.rotation.x =
                Math.PI / 3 +
                Math.sin(time * 0.5) *
                0.12;

            particles.rotation.y =
                time * 0.04;

            particles.rotation.x =
                time * 0.02;

            const pulse =
                1 +
                Math.sin(time * 1.8) *
                0.035;

            core.scale.setScalar(
                pulse
            );

            cyanLight.intensity =
                7 +
                Math.sin(time * 2) *
                2;

            violetLight.intensity =
                6 +
                Math.sin(time * 1.5) *
                1.5;

            renderer.render(
                scene,
                camera
            );

            animationFrame =
                requestAnimationFrame(
                    animate
                );
        };

        animate();

        /* ============================================================
           CLEANUP
        ============================================================ */

        return () => {
            disposed = true;

            cancelAnimationFrame(
                animationFrame
            );

            window.removeEventListener(
                "resize",
                handleResize
            );

            window.removeEventListener(
                "orientationchange",
                handleResize
            );

            sphereGeometry.dispose();
            sphereMaterial.dispose();

            outerGeometry.dispose();
            outerMaterial.dispose();

            ringGeometryOne.dispose();
            ringMaterialOne.dispose();

            ringGeometryTwo.dispose();
            ringMaterialTwo.dispose();

            particleGeometry.dispose();
            particleMaterial.dispose();

            renderer.dispose();

            scene.clear();
        };
    }, [finished]);

    /* ================================================================
       REMOVE LOADER
    ================================================================ */

    if (finished) {
        return null;
    }

    return (
        <div
            className={[
                "fixed",
                "inset-0",
                "z-[999999]",
                "w-full",
                "h-[100dvh]",
                "min-h-[100svh]",
                "overflow-hidden",
                "bg-[#05060a]",
                "flex",
                "items-center",
                "justify-center",
                "select-none",
                "pointer-events-none",
                "transition-all",
                "duration-700",
                "ease-[cubic-bezier(0.22,1,0.36,1)]",
                exiting
                    ? "opacity-0 scale-[1.025]"
                    : "opacity-100 scale-100",
            ].join(" ")}
            role="status"
            aria-live="polite"
            aria-label="Loading ShopNest"
        >
            {/* ========================================================
                BACKGROUND
            ======================================================== */}

            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[75vw] max-w-[720px] aspect-square rounded-full bg-cyan-400/[0.035] blur-[120px]" />

                <div className="absolute -left-32 -top-32 w-[420px] h-[420px] rounded-full bg-violet-500/[0.035] blur-[130px]" />

                <div className="absolute -right-40 -bottom-40 w-[500px] h-[500px] rounded-full bg-cyan-400/[0.025] blur-[140px]" />

                <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            {/* ========================================================
                BRAND
            ======================================================== */}

            <div className="absolute top-0 left-0 right-0 flex justify-center pt-[max(22px,env(safe-area-inset-top))] px-5">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.9)]" />

                    <span className="text-[9px] sm:text-xs font-semibold tracking-[0.35em] text-white/40">
                        SHOPNEST
                    </span>

                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_14px_rgba(167,139,250,0.8)]" />
                </div>
            </div>

            {/* ========================================================
                MAIN CONTENT
            ======================================================== */}

            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4 py-20 sm:px-6">
                <div
                    ref={containerRef}
                    className="relative w-[min(76vw,46vh,340px)] h-[min(76vw,46vh,340px)] min-w-[200px] min-h-[200px] sm:w-[min(58vw,50vh,380px)] sm:h-[min(58vw,50vh,380px)] sm:min-w-[250px] sm:min-h-[250px]"
                >
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 block w-full h-full"
                        aria-hidden="true"
                    />

                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-cyan-300/[0.025] blur-3xl" />
                    </div>
                </div>

                {/* ====================================================
                    TEXT
                ==================================================== */}

                <div className="relative w-full max-w-[420px] flex flex-col items-center text-center -mt-1 sm:-mt-3">
                    <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-6 sm:w-10 h-px bg-gradient-to-r from-transparent to-cyan-300/40" />

                        <span className="text-[9px] sm:text-[10px] font-medium tracking-[0.28em] uppercase text-cyan-200/55">
                            INITIALIZING
                        </span>

                        <div className="w-6 sm:w-10 h-px bg-gradient-to-l from-transparent to-violet-400/40" />
                    </div>

                    <h1 className="m-0 text-[clamp(1.4rem,7vw,2.3rem)] leading-tight font-semibold tracking-[-0.025em] text-white">
                        Welcome to

                        <span className="block mt-1 bg-gradient-to-r from-cyan-200 via-white to-violet-300 bg-clip-text text-transparent">
                            ShopNest
                        </span>
                    </h1>

                    <p className="mt-3 text-[11px] sm:text-sm leading-5 text-white/35">
                        Preparing your shopping experience
                    </p>

                    {/* =================================================
                        PROGRESS
                    ================================================= */}

                    <div className="w-[min(78vw,290px)] mt-7">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-medium tracking-[0.16em] uppercase text-white/25">
                                Loading
                            </span>

                            <span className="text-[10px] font-medium tabular-nums text-cyan-200/65">
                                {progress}%
                            </span>
                        </div>

                        <div className="relative w-full h-[2px] rounded-full overflow-hidden bg-white/[0.08]">
                            <div
                                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-cyan-400 via-cyan-200 to-violet-400 shadow-[0_0_12px_rgba(103,232,249,0.55)] transition-[width] duration-150 ease-linear"
                                style={{
                                    width: `${progress}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================================
                BOTTOM STATUS
            ======================================================== */}

            <div className="absolute left-0 right-0 bottom-0 flex items-center justify-center pb-[max(20px,env(safe-area-inset-bottom))] px-5">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300/60" />

                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-300/80" />
                    </span>

                    <span className="text-[9px] sm:text-[10px] tracking-[0.18em] uppercase text-white/20">
                        Secure connection
                    </span>
                </div>
            </div>
        </div>
    );
}