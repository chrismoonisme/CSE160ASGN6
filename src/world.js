import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';

function main() {

    //get canvas
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
    //persepctive camera
    const fov = 30;
    const aspect = 2;  
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    //set position of camera
    camera.position.set(0,10,25);

    //minmax helper class
    class MinMaxGUIHelper {

		constructor( obj, minProp, maxProp, minDif ) {

			this.obj = obj;
			this.minProp = minProp;
			this.maxProp = maxProp;
			this.minDif = minDif;

		}
		get min() {

			return this.obj[ this.minProp ];

		}
		set min( v ) {

			this.obj[ this.minProp ] = v;
			this.obj[ this.maxProp ] = Math.max( this.obj[ this.maxProp ], v + this.minDif );

		}
		get max() {

			return this.obj[ this.maxProp ];

		}
		set max( v ) {

			this.obj[ this.maxProp ] = v;
			this.min = this.min; // this will call the min setter

		}

	}

    //update camera
    function updateCamera() {

		camera.updateProjectionMatrix();

	}

    const gui = new GUI();
	gui.add( camera, 'fov', 1, 180 ).onChange( updateCamera );
	const minMaxGUIHelper = new MinMaxGUIHelper( camera, 'near', 'far', 0.1 );
	gui.add( minMaxGUIHelper, 'min', 0.1, 50, 0.1 ).name( 'near' ).onChange( updateCamera );
	gui.add( minMaxGUIHelper, 'max', 0.1, 50, 0.1 ).name( 'far' ).onChange( updateCamera );
    //gui.add(controls, 'enableDamping').name('Enable Damping');
    //gui.add(controls, 'autoRotate').name('Auto Rotate');

    //orbitals
	const controls = new OrbitControls( camera, canvas );
	controls.target.set( 0, 5, 0 );
	controls.update();


    //scene
    const scene = new THREE.Scene();
    
    //billboard specs
    function makeLabelCanvas(baseWidth, size, name) {
        const borderSize = 10;
        const padding = 30;
        const lineHeight = size * 1.2;
        const indent = 30;
        const radius = 8;
    
        const ctx = document.createElement('canvas').getContext('2d');
        const font = `${size}px 'Press Start 2P', sans-serif`;
        ctx.font = font;
    
        let lines;
        if (typeof name === "string") {
            lines = name.split("\n").map(text => ({ text, color: "white" })); // Default color white
        } else {
            lines = name; 
        }
    
        const textWidth = Math.max(...lines.map(line => ctx.measureText(line.text).width));
        const doubleBorderSize = borderSize * 2;
        const width = textWidth + doubleBorderSize + padding * 2;
        const height = (lineHeight * lines.length) + doubleBorderSize + padding;
    
        ctx.canvas.width = width;
        ctx.canvas.height = height;
    
        ctx.font = font;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
    
        ctx.fillStyle = "#555555"; 
        ctx.strokeStyle = "#2c333f"; 
        ctx.lineWidth = borderSize;
    
        ctx.beginPath();
        ctx.moveTo(borderSize + radius, borderSize);
        ctx.arcTo(width - borderSize, borderSize, width - borderSize, height - borderSize, radius);
        ctx.arcTo(width - borderSize, height - borderSize, borderSize, height - borderSize, radius);
        ctx.arcTo(borderSize, height - borderSize, borderSize, borderSize, radius);
        ctx.arcTo(borderSize, borderSize, width - borderSize, borderSize, radius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    
        ctx.fillStyle = "#212121"; 
        ctx.beginPath();
        ctx.moveTo(borderSize + radius, borderSize);
        ctx.arcTo(width - borderSize, borderSize, width - borderSize, height - borderSize, radius);
        ctx.arcTo(width - borderSize, height - borderSize, borderSize, height - borderSize, radius);
        ctx.arcTo(borderSize, height - borderSize, borderSize, borderSize, radius);
        ctx.arcTo(borderSize, borderSize, width - borderSize, borderSize, radius);
        ctx.closePath();
        ctx.fill();
    
        lines.forEach((line, i) => {
            ctx.fillStyle = line.color; 
            ctx.fillText(line.text, borderSize + indent, borderSize + padding + (i * lineHeight));
        });
    
        return ctx.canvas;
    }
    
    //set a billboard
    function makeLabel(x, y, z, labelWidth, size, phrases) {
        const canvas = makeLabelCanvas(labelWidth, size, phrases);        
        
        const texture = new THREE.CanvasTexture(canvas);

        texture.colorSpace = THREE.SRGBColorSpace;

        texture.minFilter = THREE.LinearFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;

        const labelMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
        });

        const label = new THREE.Sprite(labelMaterial);
        label.position.set(x, y, z);

        const labelBaseScale = 0.01;
        label.scale.x = canvas.width * labelBaseScale;
        label.scale.y = canvas.height * labelBaseScale;

        scene.add(label);
        return label;
    }

    //make some billboards
    makeLabel(-5, 5, 0, 150, 32, [
        { text: "Ruined Portal", color: "yellow" },
        { text: "by Chris", color: "white" }
    ]);

    makeLabel(-5, 3.4, 0, 150, 32, [
        { text: "CSE 160", color: "#bd39aa" },
        { text: "Final Project", color: "white" }
    ]);



    //material
    const material = new THREE.MeshPhongMaterial({
        color: 0x44aa88
    }); 

    //texture loader
    const loader = new THREE.TextureLoader();
    const obsidian = loader.load( '../resources/obsidian.jpg' );
    obsidian.colorSpace = THREE.SRGBColorSpace;
    const nether = loader.load( '../resources/nether.jpg' );
    nether.colorSpace = THREE.SRGBColorSpace;
    const magma = loader.load( '../resources/magma.jpg' );
    magma.colorSpace = THREE.SRGBColorSpace;
    const fire = loader.load( '../resources/fire.png' );
    fire.colorSpace = THREE.SRGBColorSpace;

    const texture = loader.load(
        '../resources/nightsky.jpg',
        () => {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          texture.colorSpace = THREE.SRGBColorSpace;
          scene.background = texture;
        }
    );

    //directional light
    const dcolor = 0xFFFFFF;
    const dintensity = 3;
    const dlight = new THREE.DirectionalLight(dcolor, dintensity);
    dlight.position.set(-1, 2, 4);
    scene.add(dlight);

    //ambient light gui helper class
    class ColorGUIHelper {

		constructor( object, prop ) {

			this.object = object;
			this.prop = prop;

		}
		get value() {

			return `#${this.object[ this.prop ].getHexString()}`;

		}
		set value( hexString ) {

			this.object[ this.prop ].set( hexString );

		}

	}

    //ambient light
    const acolor = 0xd9268e;
    const aintensity = 2;
    const alight = new THREE.AmbientLight(acolor, aintensity);
    scene.add(alight);

    const agui = new GUI();
	gui.addColor( new ColorGUIHelper( alight, 'color' ), 'value' ).name( 'ambient color' );
	gui.add( alight, 'intensity', 0, 5, 0.01 ).name( 'ambient intensity' );

    //point lights
    //const pcolor = 0xFF6600;
    //const pintensity = 150;
    //const plight = new THREE.PointLight(pcolor, pintensity);
    //plight.position.set(2, 0.5, 2);
    //scene.add(plight);

    //const plight2 = new THREE.PointLight(pcolor, pintensity);
    //plight2.position.set(-1, 0.5, -1);
    //scene.add(plight2);


    //rock model
    const objLoader = new OBJLoader();
    objLoader.load('../resources/rockFlat.obj', (rock) => {

        //scale and pos
        rock.scale.set(7, 20, 7); 
        rock.position.set(0, -3.3, 0); 

        //color
        rock.traverse((child) => {
            if (child.isMesh) {
                child.material = new THREE.MeshPhongMaterial({ color: 0x808080 }); // Gray color
            }
        });

        scene.add(rock);
    });


    //create a shape in the scene
    const animated = [];
    function makeInstance(shapeType, tex, c, x, y, z, a){

        let geometry;
    
        //set geometry based on shape
        switch(shapeType){

            case "cube":
                geometry = new THREE.BoxGeometry(1, 1, 1);
                break;
            case "sphere":
                geometry = new THREE.SphereGeometry(0.5, 32, 32);
                break;
            case "pyramid": 
                geometry = new THREE.TetrahedronGeometry(1);
                break;
            default:
                console.warn("unspecified shape, defaulting to cube.");
                geometry = new THREE.BoxGeometry(1, 1, 1);
        }
    
        //set texture or color
        const material = new THREE.MeshPhongMaterial(
            c ? { color: c } : { map: tex }
        );
    
        //create the shape
        const shape = new THREE.Mesh(geometry, material);
    
        //add to scene
        scene.add(shape);
    
        //set position
        shape.position.set(x, y +0.5 , z);

        //store animated objects
        if (a) {
            animated.push({ object: shape, initialY: shape.position.y });
        }
    
        return shape;
    }

    //magma block (glowing)
    function glowblock(x, y, z){

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        
        const material = new THREE.MeshPhongMaterial({ 
            map: magma, 
            emissive: 0xFF6600,
            emissiveMap: magma, 
            emissiveIntensity: 50
        });        
        
        const cube = new THREE.Mesh(geometry, material);
    
        //point light
        const light = new THREE.PointLight(0xFF6600, 150, 10);
        light.position.set(0, 0, 0);
        light.castShadow = true;
    
        cube.add(light);
    
        cube.position.set(x, y + 0.5, z);
    
        scene.add(cube);

        const sparks = createSparks(x, y + 0.3, z);

        return cube;
    }

    function createSparks(x, y, z) {

        //rand 1-3
        let particleCount = Math.floor(Math.random() * 3) + 1;
        let geometry = new THREE.BufferGeometry();
        let positions, velocities;
        
        //reset func
        function resetSparks() {

            //reset particle count
            particleCount = Math.floor(Math.random() * 3) + 1;

            positions = new Float32Array(particleCount * 3);
            velocities = new Float32Array(particleCount * 3);
            
            //for each
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                positions[i3] = 0;
                positions[i3 + 1] = 0;
                positions[i3 + 2] = 0;
    
                velocities[i3] = (Math.random() - 0.5) * 0.03;
                velocities[i3 + 1] = Math.random() * 0.1 + 0.1;
                velocities[i3 + 2] = (Math.random() - 0.5) * 0.03;
            }
    
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
            geometry.attributes.position.needsUpdate = true;
        }
        
        //inital reset
        resetSparks();
        
        //particle fire texture
        const material = new THREE.PointsMaterial({
            map: fire,
            size: 4,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending,
        });
    
        const sparks = new THREE.Points(geometry, material);
        sparks.position.set(x, y, z);
        scene.add(sparks);
        
        //animate falling
        function animateSparks() {
            const positions = sparks.geometry.attributes.position.array;
            const velocities = sparks.geometry.attributes.velocity.array;
            let allSparksFallen = true;
    
            //for each particle
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
    
                positions[i3] += velocities[i3];
                positions[i3 + 1] += velocities[i3 + 1];
                positions[i3 + 2] += velocities[i3 + 2];
                
                //make particles fall
                velocities[i3 + 1] -= 0.005; 
    
                //check if this spark is still above the threshold
                if (positions[i3 + 1] >= -0.3) {
                    allSparksFallen = false;
                }
            }
    
            sparks.geometry.attributes.position.needsUpdate = true;
    
            if (allSparksFallen) {

                //random delay
                let waitTime = Math.random() * 800 + 200; 
                setTimeout(() => {

                    //reset sparks (new amount)
                    resetSparks();   
                    
                    //reset animation
                    animateSparks();   

                }, waitTime);

            }else{

                requestAnimationFrame(animateSparks);

            }
        }
    
        animateSparks();
        return sparks;

    }
    

    //all basic shapes
    const cubes = [

        makeInstance("cube", nether, null, 2, 0, 1),
        glowblock(2, 0, 2),
        makeInstance("cube", nether, null, 1, 0, 1),
        makeInstance("cube", nether, null, 2, 0, -1),
        makeInstance("cube", nether, null, 1, 0, -1),
        makeInstance("cube", nether, null, 0, 0, -1),
        glowblock(-1, 0, -1),
        makeInstance("cube", nether, null, 3, 0, 0),

       
        makeInstance("cube", nether, null, 0, 0, 1),
        makeInstance("cube", nether, null, -1, 0, 1),
        makeInstance("cube", nether, null, -2, 0, 0),

        //right portal frame
        makeInstance("cube", obsidian, null, 2, 1, 0),
        makeInstance("cube", obsidian, null, 2, 2, 0),
        makeInstance("cube", obsidian, null, 2, 3, 0),
        makeInstance("cube", obsidian, null, 2, 4, 0),

        //left portal frame
        makeInstance("cube", obsidian, null, -1, 1, 0),
        makeInstance("cube", obsidian, null, -1, 2, 0),
        makeInstance("cube", obsidian, null, -1, 3, 0),
        makeInstance("cube", obsidian, null, -1, 4, 0),
        makeInstance("cube", obsidian, null, -1, 5, 0),
        makeInstance("cube", obsidian, null, 0, 5, 0),

        //extra blocks
        makeInstance("cube", null, 0xFFD700, 0, 6, 0),
        makeInstance("pyramid", null, 0xFFD700, 0, 7.5, 0, true).scale.set(.7, .7, .7),
        makeInstance("cube", null, 0x808080, 2, 5, 0),
        makeInstance("cube", null, 0x808080, -2, 1, 0),

        makeInstance("cube", null, 0xFFD700, 1, 1.5, 1, true).scale.set(.7, .7, .7),
        makeInstance("sphere", null, 0x08B6CE, -1, 1, 2, true),

        //bottom
        makeInstance("cube", obsidian, null, 1, 1, 0),
        makeInstance("cube", obsidian, null, 0, 1, 0),

        //makeInstance("cube", null, 0x808080, 0, -25.5, 0).scale.set(7, 50, 7)
    ];

    //ground plane
    const planeSize = 40;
    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({ color: 0x888888, side: THREE.DoubleSide });
    const ground = new THREE.Mesh(planeGeo, planeMat);
    ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    ground.position.y = 0; // Position at the bottom
    ground.receiveShadow = true; // Enable shadows
    //scene.add(ground);



    //animate function
    function render(time) {

		time *= 0.001;

        //move all animated objects
        animated.forEach(entry => {
            entry.object.rotation.y += 0.05; // Spin around Y-axis
            entry.object.position.y = entry.initialY + Math.sin(time * 2) * 0.5; // Move up and down
        });

        //render
		renderer.render( scene, camera );
		requestAnimationFrame( render );

	}

    //render
    requestAnimationFrame( render );

}



//call main
main();