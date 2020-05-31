window.Xplore = window.classes.Xplore =
    class Xplore extends Scene_Component {
        constructor(context, control_box) {
            // The scene begins by requesting the camera, shapes, and materials it will need.
            super(context, control_box);
            // First, include a secondary Scene that provides movement controls:
            if (!context.globals.has_controls)
                context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

            const r = context.width / context.height;
            context.globals.graphics_state.camera_transform = Mat4.translation([0, -3, 0]);  // Locate the camera here (inverted matrix).
            context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

            const shapes = {
                'box': new Cube(),
                'ground': new Ground(),
                'triangle': new Triangle(),
                'pyramid': new Pyramid(),
                'model': new Shape_From_File("assets/fish.obj"),
                'tree': new Tree(),
                'fish': new Fish()
            };

            this.materials = {
                grass: context.get_instance(Phong_Shader).material(Color.of(0, 1, 0, 1), {
                    ambient: .4,
                    diffusivity: .4
                }),
                bark:     context.get_instance( Phong_Shader ).material( Color.of( 0.55,0.27,0.08,1 )),
                green1:   context.get_instance( Phong_Shader ).material( Color.of( 0,0.3,0.1,1 ), {ambient: 0.2}),
                green2:   context.get_instance( Phong_Shader ).material( Color.of( 0,0.4,0.1,1 ), {ambient: 0.4}),
                green3:   context.get_instance( Phong_Shader ).material( Color.of( 0,0.6,0.2,1 ), {ambient: 0.6}),
                stars:    context.get_instance( Phong_Shader ).material( Color.of( 0, 0, 0, 1  ), {ambient: 1,
                        diffusivity:1,
                        specularity: 0.1 })
            };


            // At the beginning of our program, load one of each of these shape
            // definitions onto the GPU.  NOTE:  Only do this ONCE per shape
            // design.  Once you've told the GPU what the design of a cube is,
            // it would be redundant to tell it again.  You should just re-use
            // the one called "box" more than once in display() to draw
            // multiple cubes.  Don't define more than one blueprint for the
            // same thing here.
            this.submit_shapes(context, shapes);

            // Make some Material objects available to you:
            this.clay = context.get_instance(Phong_Shader).material(Color.of(.9, .5, .9, 1), {
                ambient: .4,
                diffusivity: .4
            });
            this.white = context.get_instance(Basic_Shader).material();
            this.plastic = this.clay.override({specularity: .6});
            this.grass_texture = this.materials.grass.override({texture: context.get_instance("assets/grass.jpg")});
            this.stars = this.plastic.override({texture: context.get_instance('assets/stars.png')})
            this.materials.stars = this.stars.override({texture: context.get_instance('assets/newspaper.png')})

            this.lights = [new Light(Vec.of(0, 5, 5, 1), Color.of(1, .4, 1, 1), 100000)];

            this.randomX =  [...Array(100)].map(() => Math.floor(300*Math.random() + -150));
            this.randomZ =  [...Array(100)].map(() => Math.floor(300*Math.random() + -370));
            // 100 random tree sizes
            this.randomSize = [...Array(100)].map(() => Math.floor(10*Math.random() + 5));
        }


        make_control_panel()
        // Draw the scene's wbuttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        {

        }

        drawGround() {
            let model_transform = Mat4.identity();
            model_transform = model_transform.times(Mat4.scale([300, 1, 300]));
            this.shapes.ground.draw(this.globals.graphics_state, model_transform, this.grass_texture);
        }

        drawTree(x, z, height) {
            let loc = Mat4.identity().times(Mat4.translation([x,0,z]));

            let trunk_transform = loc.times(Mat4.scale([1,height,1]));

            let leaves_bottom_transform = loc.times(Mat4.translation([0,.8*height,0]))
                                            .times(Mat4.scale([1.5*height,1*height,1.5*height]));

            let leaves_middle_transform = loc.times(Mat4.translation([0,1.2*height,0]))
                                            .times(Mat4.scale([1.3*height,1*height,1.3*height]));

            let leaves_top_transform = loc.times(Mat4.translation([0,1.6*height,0]))
                                        .times(Mat4.scale([1*height,1*height,1*height]));

            this.shapes.box.draw(this.globals.graphics_state, trunk_transform, this.materials.bark);
            this.shapes.pyramid.draw(this.globals.graphics_state, leaves_bottom_transform, this.materials.green1);
            this.shapes.pyramid.draw(this.globals.graphics_state, leaves_middle_transform, this.materials.green2);
            this.shapes.pyramid.draw(this.globals.graphics_state, leaves_top_transform, this.materials.green3);

        }

        drawForest() {
            var i;
            // Draw 10 trees on each side to make a path
            for (i = 0; i < 10; i++) {
                this.drawTree( 8,  i*-7,  5)
                this.drawTree(-8, i*-7,  5)
                // Draw 5 trees to close path behind character
                if (i%2 == 0) {
                    this.drawTree(1.8*i - 8, 0, 10);
                }
            }

            // Draw 50 tress in "random" places, in area (-150 < x < 150   and    370 < z < 70)
            var j;
            for (j = 0; j < 50; j++) {
                this.drawTree(this.randomX[j], this.randomZ[j], this.randomSize[j]);
            }
        }
        //textures not working for fish, based on obj file
        drawModels () {
            let modelt = Mat4.identity().times(Mat4.translation([25,25,25])).times(Mat4.scale([25,25,25]));
//             this.shapes.fish.draw(this.globals.graphics_state, modelt, this.materials.green1);
            this.shapes.tree.draw(this.globals.graphics_state, modelt, this.grass_texture);
           
        }

        display(graphics_state) {
            graphics_state.lights = this.lights;        // Use the lights stored in this.lights.

            this.drawGround();

            this.drawForest();

            this.drawModels();
        }

    };
