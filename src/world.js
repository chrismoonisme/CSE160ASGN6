import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

function main() {

    //get canvas
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
    //camera
    const fov = 30;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    //set position of camera
    camera.position.set(0,10,20);

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

    //orbitals
	const controls = new OrbitControls( camera, canvas );
	controls.target.set( 0, 5, 0 );
	controls.update();


    //scene
    const scene = new THREE.Scene();

    //material
    const material = new THREE.MeshPhongMaterial({
        color: 0x44aa88
    }); 

    //texture loader
    const loader = new THREE.TextureLoader();
    const obsidian = loader.load( '/resources/obsidian.jpg' );
    obsidian.colorSpace = THREE.SRGBColorSpace;
    const nether = loader.load( '/resources/nether.jpg' );
    nether.colorSpace = THREE.SRGBColorSpace;

    //light
    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

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
            case "pyramid": // A pyramid is a Tetrahedron in Three.js
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

    //all basic shapes
    const cubes = [

        makeInstance("cube", nether, null, 2, 0, 1),
        makeInstance("cube", nether, null, 2, 0, 2),
        makeInstance("cube", nether, null, 1, 0, 1),
        makeInstance("cube", nether, null, 2, 0, -1),
        makeInstance("cube", nether, null, 1, 0, -1),
        makeInstance("cube", nether, null, 0, 0, -1),
        makeInstance("cube", nether, null, -1, 0, -1),
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
        makeInstance("cube", null, 0x808080, 2, 5, 0),
        makeInstance("cube", null, 0x808080, -2, 1, 0),

        makeInstance("cube", null, 0xFFD700, 1, 1.5, 1, true),

        makeInstance("sphere", null, 0x08B6CE, -1, 1, 2, true),



        //bottom
        makeInstance("cube", obsidian, null, 1, 1, 0),
        makeInstance("cube", obsidian, null, 0, 1, 0),
        

    ];

    //ground plane
    const planeSize = 20;
    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({ color: 0x888888, side: THREE.DoubleSide });
    const ground = new THREE.Mesh(planeGeo, planeMat);
    ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    ground.position.y = 0; // Position at the bottom
    ground.receiveShadow = true; // Enable shadows
    scene.add(ground);



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