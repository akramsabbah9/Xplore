window.My_Scene = window.classes.My_Scene =
    class My_Scene extends Scene_Component {
        constructor(context, control_box) {
            // The scene begins by requesting the camera, shapes, and materials it will need.
            super(context, control_box);
            // First, include a secondary Scene that provides movement controls:
            //if (!context.globals.has_controls)
            //    context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

            const r = context.width / context.height;
            context.globals.graphics_state.camera_transform = Mat4.translation([5, -10, -30]);  // Locate the camera here (inverted matrix).
            context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

            const shapes = {
                'box': new Cube(),
                'outline': new Cube_Outline()
            };

            this.submit_shapes(context, shapes);

            // Make some Material objects available to you:
            this.clay = context.get_instance(Phong_Shader).material(Color.of(.9, .5, .9, 1), {
                ambient: .4,
                diffusivity: .4
            });
            this.white = context.get_instance(Basic_Shader).material();
            this.plastic = this.clay.override({specularity: .6});

            this.lights = [new Light(Vec.of(0, 5, 5, 1), Color.of(1, .4, 1, 1), 100000)];

            this.velocity = 0; // player velocity. Will be used to move the player, and consequently the camera.
            this.rotation = 0; // rotates the camera left (negative) or right (positive)

        }


        make_control_panel()
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        {
            this.key_triggered_button( "Move Forward",  [ "w" ], () => this.moving = () => 1, () => undefined, () => this.moving = () => 0 );
            this.key_triggered_button( "Move Backward",  [ "s" ], () => this.moving = () => 2, () => undefined, () => this.moving = () => 0 );
            this.key_triggered_button( "Rotate Left",  [ "a" ], () => this.moving = () => 3, () => undefined, () => this.moving = () => 0 );
            this.key_triggered_button( "Rotate Right",  [ "d" ], () => this.moving = () => 4, () => undefined, () => this.moving = () => 0 );

            //this.key_triggered_button( "Move Forward",  [ "i" ], () => this.velocity += 0.5 );
        }


        display(graphics_state) {
            graphics_state.lights = this.lights;        // Use the lights stored in this.lights.

            this.shapes.box.draw(graphics_state, Mat4.identity(), this.plastic)

            //this.move_player(graphics_state.camera_transform, this.velocity, this.rotation);
            //console.log(this.velocity);

            if (this.moving)
                switch(this.moving()) {
                    case 1:
                        graphics_state.camera_transform = graphics_state.camera_transform.times(Mat4.translation([0, 0, 0.5]));
                        //this.moving = () => 0;
                        break;
                    case 2:
                        graphics_state.camera_transform = graphics_state.camera_transform.times(Mat4.translation([0, 0, -0.5]));
                        //this.moving = () => 0;
                        break;
                    case 3:
                        graphics_state.camera_transform = graphics_state.camera_transform.times(Mat4.rotation(0.05, Vec.of(0, 1, 0)));
                        //this.moving = () => 0;
                        break;
                    case 4:
                        graphics_state.camera_transform = graphics_state.camera_transform.times(Mat4.rotation(0.05, Vec.of(0, -1, 0)));
                        //this.moving = () => 0;
                        break;
                    default:
                        //console.log(graphics_state.camera_transform);
                        break;
                }
        }

        // moves the player forward,  backward,
        move_player(camera_transform, velocity, rotation) {

            camera_transform = (velocity > 0) ? 1 : 0;
            return camera_transform;
        }

    };
