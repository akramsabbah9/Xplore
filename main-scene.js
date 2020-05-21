window.My_Scene = window.classes.My_Scene =
    class My_Scene extends Scene_Component {
        constructor(context, control_box) {
            // The scene begins by requesting the camera, shapes, and materials it will need.
            super(context, control_box);
            // First, include a secondary Scene that provides movement controls:
            if (!context.globals.has_controls)
                context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

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

            /* CAMERA CONTROLS */
            this.mouse = Vec.of(0, 0); // current mouse position
            this.rot_vec = Vec.of(0, 0, 0); // vector used to form rotation matrix
            this.frozen = true;

            context.canvas.addEventListener("mousemove", event => {
                event.preventDefault();
                this.update_mouse(event, context.canvas);
            });
        }

        update_mouse(event, canvas) {
            // when mouse is moved, update current rotational position and set new mouse position
            const rect = canvas.getBoundingClientRect();
            const newpos = Vec.of(event.clientX - (rect.left + rect.right) / 2,
                                  event.clientY - (rect.bottom + rect.top) / 2,
                                  0);
            this.rot_vec = (!this.frozen) ? newpos.minus(this.mouse) : Vec.of(0, 0, 0);
            this.mouse = newpos;
        }


        make_control_panel()
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        {
            this.key_triggered_button( "Move Forward",  [ "ArrowUp" ], () => this.moving = () => 1, () => undefined, () => this.moving = () => 0 );
            this.key_triggered_button( "Move Backward",  [ "ArrowDown" ], () => this.moving = () => 2, () => undefined, () => this.moving = () => 0 );
            this.key_triggered_button( "Rotate Left",  [ "ArrowLeft" ], () => this.moving = () => 3, () => undefined, () => this.moving = () => 0 );
            this.key_triggered_button( "Rotate Right",  [ "ArrowRight" ], () => this.moving = () => 4, () => undefined, () => this.moving = () => 0 );
            this.key_triggered_button( "Toggle mouse rotation",  [ "k" ], () => this.frozen = !this.frozen);
        }


        display(graphics_state) {
            graphics_state.lights = this.lights;        // Use the lights stored in this.lights.

            this.shapes.box.draw(graphics_state, Mat4.identity(), this.plastic)

            graphics_state.camera_transform = this.move_player(graphics_state.camera_transform);

        }

        move_player(camera) {
            // rotate camera by rot_vec. Then move in the desired direction.
            if (!this.frozen && !this.rot_vec.equals(Vec.of(0, 0, 0)))
            {
                camera = camera.times(Mat4.rotation(1, this.rot_vec));
                this.rot_vec = Vec.of(0, 0, 0);
            }

            if (this.moving)
                switch(this.moving()) {
                    case 1:
                        camera = camera.times(Mat4.translation([0, 0, 0.5]));
                        break;
                    case 2:
                        camera = camera.times(Mat4.translation([0, 0, -0.5]));
                        break;
                    case 3:
                        camera = camera.times(Mat4.rotation(0.05, Vec.of(0, 1, 0)));
                        break;
                    case 4:
                        camera = camera.times(Mat4.rotation(0.05, Vec.of(0, -1, 0)));
                        break;
                    default:
                        //console.log(camera);
                        break;
                }

            return camera;
        }

    };
