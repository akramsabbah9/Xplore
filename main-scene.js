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
                'sphere': new Subdivision_Sphere(4),
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
                lav: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1)),
                lava:     context.get_instance(Texture_Scroll_X).material(Color.of(0, 0, 0, 1), 
                                                    {ambient: 1, texture: context.get_instance("assets/lava.jpg", false)} ),
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
            this.stars = this.plastic.override({texture: context.get_instance('assets/stars.png')});

            this.sky_texture = this.materials.sky.override({texture: context.get_instance('assets/sky_texture.jpg')});
            this.mountains = this.materials.sky.override({texture: context.get_instance('assets/mountains.jpg')});
            
            this.nebula = this.materials.sky.override({texture: context.get_instance('assets/night.jpg')});

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

        drawBorder(x, y, z, size, height, texture){
            let loc = Mat4.translation([x,y,z])
            loc = loc.times(Mat4.scale([size, height, size]))
            this.shapes.border.draw(this.globals.graphics_state, loc, texture)
        }

        /*drawLevelOne(){
            this.drawGround(0, 0, -200, 400, this.grass_texture);
            this.drawForest();
            this.drawGround(0, 50, -200, 400, this.sky_texture)

            this.drawBorder(0, -10, -200, 400, 100, this.mountains)

            let cam_x = this.ctrans[0][3]
            let cam_z = this.ctrans[2][3]

            if (cam_x < -98 && cam_x > -102 && cam_z < -278 && cam_z > -282){
                this.current_level = 2;
            }
        }*/

        drawShape(shape, x, y, z, size, roty, texture) {
            const trans = Mat4.identity().times(Mat4.translation([x,y,z]))
                                         .times(Mat4.scale([size, size, size]))
                                         .times(Mat4.rotation(roty, Vec.of(0,1,0)));
            shape.draw(this.globals.graphics_state, trans, texture);
        }

        drawLavaLevel() {
            this.drawStage();
        }

        drawStage() {
            this.drawShape(this.shapes.ground, 0, -1, 0, 400, Math.PI/2, this.materials.lava);
            const sky_trans = Mat4.identity().times(Mat4.translation([0,-300,0]))
                                             .times(Mat4.scale([600, 600, 600]))
                                             .times(Mat4.rotation(Math.PI/2, Vec.of(1,0,0)));
            this.drawShape(this.shapes.ground, 0, 0, 0, 400, 0, this.materials.glass);
            this.shapes.sphere.draw(this.globals.graphics_state, sky_trans, this.nebula);
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

            this.drawLavaLevel();

            this.ctrans = this.move();
            graphics_state.camera_transform = Mat4.inverse(this.ctrans);

        }

    };

class Texture_Scroll_X extends Phong_Shader {
    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // TODO:  Modify the shader below (right now it's just the same fragment shader as Phong_Shader) for requirement #6.
        return `
        uniform sampler2D texture;
        void main()
        { if( GOURAUD || COLOR_NORMALS )    // Do smooth "Phong" shading unless options like "Gouraud mode" are wanted instead.
          { gl_FragColor = VERTEX_COLOR;    // Otherwise, we already have final colors to smear (interpolate) across vertices.            
            return;
          }                                 // If we get this far, calculate Smooth "Phong" Shading as opposed to Gouraud Shading.
                                            // Phong shading is not to be confused with the Phong Reflection Model.
          // period of rotation is 10s (trial and error)
          float a_time = mod(animation_time, 10.0); // used https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/mod.xhtml since glsl doesn't use %
          vec4 tex_color = texture2D( texture, vec2(f_tex_coord[0] + 0.2*a_time, f_tex_coord[1]) );  // Sample the texture image in the correct place.
                                                                                      // Compute an initial (ambient) color:
          if( USE_TEXTURE ) gl_FragColor = vec4( ( tex_color.xyz + shapeColor.xyz ) * ambient, shapeColor.w * tex_color.w ); 
          else gl_FragColor = vec4( shapeColor.xyz * ambient, shapeColor.w );
          gl_FragColor.xyz += phong_model_lights( N );                     // Compute the final color with contributions from lights.
        }`;
    }
}