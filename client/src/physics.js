import { OimoPhysics } from './jsm/physics/OimoPhysics.js';

// http://lo-th.github.io/Oimo.js/examples/test_ragdoll.html

export class Physics {
    constructor() {
        this.physics = await OimoPhysics();
    }

    // https://github.com/mrdoob/three.js/blob/master/examples/physics_oimo_instancing.html
    demo() {
        const floor = new THREE.Mesh(
            new THREE.BoxGeometry(10, 5, 10),
            new THREE.ShadowMaterial({ color: 0x111111 })
        );
        floor.position.y = - 2.5;
        floor.receiveShadow = true;
        scene.add(floor);
        physics.addMesh(floor);

        //

        const material = new THREE.MeshLambertMaterial();

        const matrix = new THREE.Matrix4();
        const color = new THREE.Color();

        // Boxes

        const geometryBox = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        boxes = new THREE.InstancedMesh(geometryBox, material, 100);
        boxes.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
        boxes.castShadow = true;
        boxes.receiveShadow = true;
        scene.add(boxes);

        for (let i = 0; i < boxes.count; i++) {

            matrix.setPosition(Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5);
            boxes.setMatrixAt(i, matrix);
            boxes.setColorAt(i, color.setHex(0xffffff * Math.random()));

        }

        physics.addMesh(boxes, 1);

    }

    step() {

        //

        // let index = Math.floor( Math.random() * boxes.count );

        // position.set( 0, Math.random() + 1, 0 );
        // physics.setMeshPosition( boxes, position, index );

        // //

        // index = Math.floor( Math.random() * spheres.count );

        // position.set( 0, Math.random() + 1, 0 );
        // physics.setMeshPosition( spheres, position, index );

    }
}