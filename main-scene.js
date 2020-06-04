window.Xplore = window.classes.Xplore =
    class Xplore extends Scene_Component {
        constructor(context, control_box) {
            // The scene begins by requesting the camera, shapes, and materials it will need.
            super(context, control_box);
            // First, include a secondary Scene that provides movement controls:
            //if (!context.globals.has_controls)
                //context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

            const r = context.width / context.height;

            context.globals.graphics_state.camera_transform = Mat4.translation([0, -5, 3]);  // Locate the camera here (inverted matrix).
            this.ctrans = Mat4.inverse( context.globals.graphics_state.camera_transform ); // transformation matrix for camera
            context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

            this.current_level = 1;


            const shapes = {
                'box': new Cube(),
                'border': new Border(),
                'ground': new Ground(),
                'triangle': new Triangle(),
                'pyramid': new Pyramid(),
            };

            this.materials = {
                grass: context.get_instance(Phong_Shader).material(Color.of(0, 1, 0, 1), {
                    ambient: .4,
                    diffusivity: .4
                }),
                sky: context.get_instance(Phong_Shader).material(Color.of(0,0,0, 1), {
                    ambient: 1,
                    diffusivity: .3
                }),
                bark:     context.get_instance( Phong_Shader ).material( Color.of( 0.55,0.27,0.08,1 )),
                green1:   context.get_instance( Phong_Shader ).material( Color.of( 0,0.3,0.1,1 ), {ambient: 0.2}),
                green2:   context.get_instance( Phong_Shader ).material( Color.of( 0,0.4,0.1,1 ), {ambient: 0.4}),
                green3:   context.get_instance( Phong_Shader ).material( Color.of( 0,0.6,0.2,1 ), {ambient: 0.6}),
                fire1:    context.get_instance( Phong_Shader ).material( Color.of( 1,0,0,1 ), {ambient: 1, specularity:0}),
                fire2:    context.get_instance( Phong_Shader ).material( Color.of( 1,0.5,0,1 ), {ambient: 1, specularity:0, diffusivity:0}),
                fire3:    context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ), {ambient: 1, specularity:0}),

                // lava scene
                glass:    context.get_instance(Phong_Shader).material(Color.of(1, 1, 1, 0.7)),
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

            this.sky_texture = this.materials.sky.override({texture: context.get_instance('assets/sky_texture.jpg')})
            this.mountains = this.materials.sky.override({texture: context.get_instance('assets/mountains.jpg')})

            this.lights = [new Light(Vec.of(0, 50, -200, 1), Color.of(1, .4, 1, 1), 100000)];


            this.randomX =  [...Array(100)].map(() => Math.floor(300*Math.random() + -150));
            this.randomZ =  [...Array(100)].map(() => Math.floor(300*Math.random() + -370));
            // 100 random tree sizes
            this.randomSize = [...Array(100)].map(() => Math.floor(10*Math.random() + 5));

            // initialize movement vars & listeners
            this.movx = this.movz = 0;
            this.rotv = this.roth = 0;
            this.m_rv = this.m_rh = 0; // mouse rotation variables
            this.ud = this.rd = Mat4.identity(); // undo/redo vertical rotation

            // listeners use 2 vars to avoid race conditions
            context.canvas.addEventListener("mousedown", e => {
                e.preventDefault();
                this.mouse_pos = this.mouse_position(e, context.canvas);
                this.mouse_down = true;
            });
            document.addEventListener("mouseup", e => {
                this.mouse_down = false;
            });
            context.canvas.addEventListener("mousemove", e => {
                e.preventDefault();
                if (this.mouse_down) this.update_mouse(e, context.canvas);
            });
        }

        make_control_panel()
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        {
            this.key_triggered_button( "Move Forward",  [ "ArrowUp" ], () => this.movz = -1, () => undefined, () => this.movz = 0 );
            this.key_triggered_button( "Move Backward",  [ "ArrowDown" ], () => this.movz = 1, () => undefined, () => this.movz = 0 );
            this.new_line();
            this.key_triggered_button( "Move Left",  [ "ArrowLeft" ], () => this.movx = -1, () => undefined, () => this.movx = 0 );
            this.key_triggered_button( "Move Right",  [ "ArrowRight" ], () => this.movx = 1, () => undefined, () => this.movx = 0 );
            this.new_line();
            this.key_triggered_button( "Look Upwards",  [ "i" ], () => this.rotv = 1, () => undefined, () => this.rotv = 0 );
            this.key_triggered_button( "Look Downwards",  [ "k" ], () => this.rotv = -1, () => undefined, () => this.rotv = 0 );
            this.new_line();
            this.key_triggered_button( "Look Left",  [ "j" ], () => this.roth = 1, () => undefined, () => this.roth = 0 );
            this.key_triggered_button( "Look Right",  [ "l" ], () => this.roth = -1, () => undefined, () => this.roth = 0 );
            this.new_line();
            this.live_string(box => box.textContent = "Position: " + this.ctrans[0][3] + ", " + this.ctrans[1][3]
                + ", " + this.ctrans[2][3]);
            this.new_line();
            /*this.live_string(box => box.textContent = "Facing: " + ((this.z_axis[0] > 0 ? "West " : "East ")
                + (this.z_axis[1] > 0 ? "Down " : "Up ") + (this.z_axis[2] > 0 ? "North" : "South")));*/
        }

        drawGround(x, y, z, size, texture) {
            let model_transform = Mat4.identity().times(Mat4.translation([x,y,z]));
            model_transform = model_transform.times(Mat4.scale([size, 1, size]));
            this.shapes.ground.draw(this.globals.graphics_state, model_transform, texture);
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
            this.drawFire(-100, 0, -280);
        }

        drawFire(x, y, z) {
            // Draw a fire at (x = -100, y = 0, z = -280 )
            let loc = Mat4.identity().times(Mat4.translation([x, y, z]))

            let wood1 = loc.times(Mat4.rotation(0.78, Vec.of(0,1,0)))
                .times(Mat4.scale([3,0.5,0.5]));

            let wood2 = loc.times(Mat4.rotation(-0.78, Vec.of(0,1,0)))
                .times(Mat4.scale([3,0.5,0.5]));

            const t = this.globals.graphics_state.animation_time / 1000;
            let fireSize1 = 2 +   0.5*Math.sin(10*t);
            let fireSize2 = 1 + 0.3*Math.sin(25*(t-1));
            let fireSize3 = 0.6 + 0.2*Math.sin(40*(t-2));

            let fire1 = loc.times(Mat4.translation([0.3,0.5,-0.3]))
                .times(Mat4.scale([1,fireSize1,1]));

            let fire2 = loc.times(Mat4.translation([-0.3,0.5,-0.3]))
                .times(Mat4.scale([1,fireSize2,1]));

            let fire3 = loc.times(Mat4.translation([0,0.5,0.3]))
                .times(Mat4.scale([1,fireSize3,1]));


            this.shapes.box.draw(this.globals.graphics_state, wood1, this.materials.bark)
            this.shapes.box.draw(this.globals.graphics_state, wood2, this.materials.bark)
            this.shapes.pyramid.draw(this.globals.graphics_state, fire1, this.materials.fire1)
            this.shapes.pyramid.draw(this.globals.graphics_state, fire2, this.materials.fire2)
            this.shapes.pyramid.draw(this.globals.graphics_state, fire3, this.materials.fire3)

        }

        drawBorder(x, y, z, size, height, texture){
            let loc = Mat4.translation([x,y,z])
            loc = loc.times(Mat4.scale([size, height, size]))
            this.shapes.border.draw(this.globals.graphics_state, loc, texture)
        }

        drawLevelOne(){
            this.drawGround(0, 0, -200, 400, this.grass_texture);
            this.drawForest();
            this.drawGround(0, 50, -200, 400, this.sky_texture)

            this.drawBorder(0, -10, -200, 400, 100, this.mountains)

            let cam_x = this.ctrans[0][3]
            let cam_z = this.ctrans[2][3]

            if (cam_x < -98 && cam_x > -102 && cam_z < -278 && cam_z > -282){
                this.current_level = 2;
            }
        }

        drawLavaLevel() {
            this.drawGround(0, 0, -200, 400, this.materials.glass);
            this.shapes.pyramid.draw(this.globals.graphics_state, Mat4.identity(), this.materials.green3);
        }

        mouse_position(event, canvas) {
            const rect = canvas.getBoundingClientRect();
            return Vec.of(event.clientX - (rect.left + rect.right) / 2,
                          event.clientY - (rect.bottom + rect.top) / 2,
                          0);
        }

        update_mouse(event, canvas) {
            // when mouse is moved, update current rotational position and set new mouse position
            const newpos = this.mouse_position(event, canvas);
            const rot_vec = newpos.minus(this.mouse_pos);
            this.m_rh = rot_vec[0];
            this.m_rv = rot_vec[1];
            this.mouse_pos = newpos;
        }

        move() { // move camera, then update the undo/redo matrices
            const h_trans = (this.mouse_down) ? 0.01*this.m_rh : 0.01*this.roth;
            const v_trans = (this.mouse_down) ? 0.01*this.m_rv : 0.01*this.rotv;

            const a = this.ctrans.times(this.ud)
                                 .times(Mat4.translation([this.movx, 0, this.movz]))
                                 .times(Mat4.rotation(h_trans, Vec.of(0, 1, 0)))
                                 .times(this.rd)
                                 .times(Mat4.rotation(v_trans, Vec.of(1, 0, 0)));

            this.ud = this.ud.times(Mat4.rotation(-v_trans, Vec.of(1, 0, 0)));
            this.rd = this.rd.times(Mat4.rotation(v_trans, Vec.of(1, 0, 0)));
            this.m_rv = this.m_rh = 0;
            return a;
        }


        display(graphics_state) {
            graphics_state.lights = this.lights;        // Use the lights stored in this.lights.

            switch(this.current_level){
                case 1: this.drawLavaLevel(); break;
                //case 2: this.drawLavaLevel(); break;

                default: this.drawLevelOne();

            }

            this.ctrans = this.move();
            graphics_state.camera_transform = Mat4.inverse(this.ctrans);

        }

    };
